using System;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using School.Api.Data;
using School.Api.Models;
using School.Api.Services;

namespace School.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PayMongoController : ControllerBase
    {
        private readonly IPayMongoService _payMongoService;
        private readonly ApplicationDbContext _context;
        private readonly ResendEmailService _emailService;

        public PayMongoController(
            IPayMongoService payMongoService,
            ApplicationDbContext context,
            ResendEmailService emailService)
        {
            _payMongoService = payMongoService;
            _context = context;
            _emailService = emailService;
        }

        // =========================================================
        // CREATE CHECKOUT SESSION
        // POST: /api/PayMongo/checkout
        // =========================================================
        [AllowAnonymous]
        [HttpPost("checkout")]
        public async Task<IActionResult> CreateCheckout([FromBody] PayMongoCheckoutDto dto)
        {
            if (dto.Amount <= 0)
            {
                return BadRequest(new { success = false, message = "Payment amount must be greater than zero." });
            }

            // Generate unique MBS Reference Number
            var refNumber = $"MBS-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}";

            var req = new PayMongoCheckoutRequest
            {
                Amount = dto.Amount,
                Title = string.IsNullOrWhiteSpace(dto.Title) ? "MBS Modular Course Tuition Fee" : dto.Title,
                Description = string.IsNullOrWhiteSpace(dto.Description) 
                    ? "Mobile Bible School & Theological Seminary Tuition Payment" 
                    : dto.Description,
                CustomerName = dto.CustomerName,
                CustomerEmail = dto.CustomerEmail,
                CustomerPhone = dto.CustomerPhone,
                ReferenceNumber = refNumber,
                SubscriptionId = dto.SubscriptionId,
                SuccessUrl = dto.SuccessUrl,
                CancelUrl = dto.CancelUrl
            };

            var result = await _payMongoService.CreateCheckoutSessionAsync(req);
            if (!result.Success)
            {
                return StatusCode(500, new { success = false, message = result.ErrorMessage });
            }

            // If a valid subscription ID is linked, create a pending Payment record in database
            if (dto.SubscriptionId.HasValue && dto.SubscriptionId.Value > 0)
            {
                try
                {
                    var sub = await _context.Subscriptions.FindAsync(dto.SubscriptionId.Value);
                    if (sub != null)
                    {
                        var payment = new Payment
                        {
                            SubscriptionId = sub.SubscriptionId,
                            Amount = dto.Amount,
                            Currency = "PHP",
                            PaymentMethod = "PayMongo",
                            Status = "PENDING",
                            ReferenceNumber = refNumber,
                            GatewayCheckoutId = result.CheckoutSessionId,
                            GatewayPaymentId = result.PaymentIntentId,
                            BillingPeriodStart = DateTime.UtcNow,
                            BillingPeriodEnd = DateTime.UtcNow.AddMonths(1),
                            Notes = $"PayMongo Checkout initiated for {dto.Title} - Ref: {refNumber}",
                            CreatedDate = DateTime.UtcNow
                        };

                        _context.Payments.Add(payment);
                        await _context.SaveChangesAsync();
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[PayMongo] Warning saving pending payment: {ex.Message}");
                }
            }

            return Ok(new
            {
                success = true,
                checkoutUrl = result.CheckoutUrl,
                checkoutSessionId = result.CheckoutSessionId,
                paymentIntentId = result.PaymentIntentId,
                referenceNumber = refNumber
            });
        }

        // =========================================================
        // VERIFY CHECKOUT SESSION STATUS
        // GET: /api/PayMongo/session/{checkoutSessionId}
        // =========================================================
        [AllowAnonymous]
        [HttpGet("session/{checkoutSessionId}")]
        public async Task<IActionResult> GetSessionStatus(string checkoutSessionId)
        {
            if (string.IsNullOrWhiteSpace(checkoutSessionId))
            {
                return BadRequest(new { success = false, message = "Invalid session ID." });
            }

            var result = await _payMongoService.GetCheckoutSessionAsync(checkoutSessionId);
            if (!result.Success)
            {
                return NotFound(new { success = false, message = result.ErrorMessage });
            }

            // If session was paid, update any matching pending payment in database to PAID
            if (result.IsPaid)
            {
                try
                {
                    var payment = await _context.Payments
                        .Where(p => p.GatewayCheckoutId == checkoutSessionId && p.Status == "PENDING")
                        .FirstOrDefaultAsync();

                    if (payment != null)
                    {
                        payment.Status = "PAID";
                        payment.PaidDate = DateTime.UtcNow;
                        payment.GatewayPaymentId = result.PaymentId ?? payment.GatewayPaymentId;
                        if (!string.IsNullOrWhiteSpace(result.PaymentMethod))
                        {
                            payment.PaymentMethod = $"PayMongo ({result.PaymentMethod.ToUpperInvariant()})";
                        }
                        await _context.SaveChangesAsync();
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[PayMongo] Warning updating payment status to PAID: {ex.Message}");
                }
            }

            return Ok(new
            {
                success = true,
                status = result.Status,
                isPaid = result.IsPaid,
                amount = result.Amount,
                paymentId = result.PaymentId,
                paymentMethod = result.PaymentMethod
            });
        }

        // =========================================================
        // WEBHOOK ENDPOINT FOR PAYMONGO REALTIME EVENTS
        // POST: /api/PayMongo/webhook
        // =========================================================
        [AllowAnonymous]
        [HttpPost("webhook")]
        public async Task<IActionResult> HandleWebhook()
        {
            try
            {
                using var reader = new StreamReader(Request.Body);
                var rawBody = await reader.ReadToEndAsync();

                using var doc = JsonDocument.Parse(rawBody);
                var root = doc.RootElement;

                if (root.TryGetProperty("data", out var dataElem) && dataElem.TryGetProperty("attributes", out var attrsElem))
                {
                    var eventType = attrsElem.GetProperty("type").GetString();

                    if (eventType == "checkout_session.payment.paid" || eventType == "payment.paid")
                    {
                        if (attrsElem.TryGetProperty("data", out var innerData))
                        {
                            var checkoutId = innerData.GetProperty("id").GetString();

                            var payment = await _context.Payments
                                .Where(p => p.GatewayCheckoutId == checkoutId || p.GatewayPaymentId == checkoutId)
                                .FirstOrDefaultAsync();

                            if (payment != null && payment.Status != "PAID")
                            {
                                payment.Status = "PAID";
                                payment.PaidDate = DateTime.UtcNow;
                                await _context.SaveChangesAsync();
                            }
                        }
                    }
                }

                return Ok(new { received = true });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[PayMongo Webhook] Error: {ex.Message}");
                return Ok(new { received = true, warning = ex.Message });
            }
        }
    }

    public class PayMongoCheckoutDto
    {
        public decimal Amount { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CustomerPhone { get; set; }
        public int? SubscriptionId { get; set; }
        public string? SuccessUrl { get; set; }
        public string? CancelUrl { get; set; }
    }
}
