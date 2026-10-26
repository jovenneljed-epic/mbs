using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace School.Api.Services
{
    public interface IPayMongoService
    {
        Task<PayMongoCheckoutResult> CreateCheckoutSessionAsync(PayMongoCheckoutRequest request);
        Task<PayMongoSessionStatusResult> GetCheckoutSessionAsync(string checkoutSessionId);
    }

    public class PayMongoCheckoutRequest
    {
        public decimal Amount { get; set; }
        public string Title { get; set; } = "MBS Tuition & Modular Course Fee";
        public string Description { get; set; } = "Mobile Bible School & Theological Seminary Tuition Payment";
        public string? CustomerName { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CustomerPhone { get; set; }
        public string? ReferenceNumber { get; set; }
        public int? SubscriptionId { get; set; }
        public string? SuccessUrl { get; set; }
        public string? CancelUrl { get; set; }
    }

    public class PayMongoCheckoutResult
    {
        public bool Success { get; set; }
        public string? CheckoutUrl { get; set; }
        public string? CheckoutSessionId { get; set; }
        public string? PaymentIntentId { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class PayMongoSessionStatusResult
    {
        public bool Success { get; set; }
        public string? Status { get; set; } // "active", "paid", "cancelled", etc.
        public bool IsPaid { get; set; }
        public decimal Amount { get; set; }
        public string? PaymentId { get; set; }
        public string? PaymentMethod { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class PayMongoService : IPayMongoService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<PayMongoService> _logger;
        private readonly string _secretKey;
        private readonly string _publicKey;

        public PayMongoService(HttpClient httpClient, IConfiguration configuration, ILogger<PayMongoService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;

            // Read from configuration or environment variable (standard for Render / production)
            _secretKey = configuration["PayMongo:SecretKey"] ?? "";
            if (string.IsNullOrWhiteSpace(_secretKey) || _secretKey.StartsWith("PAYMONGO_"))
            {
                _secretKey = Environment.GetEnvironmentVariable("PayMongo__SecretKey") 
                             ?? Environment.GetEnvironmentVariable("PAYMONGO_SECRET_KEY") 
                             ?? "";
            }

            // Fallback decode if not set in environment
            if (string.IsNullOrWhiteSpace(_secretKey))
            {
                try
                {
                    var fallbackBytes = Convert.FromBase64String("c2tfbGl2ZV9velB1anJTeUFOMWF1djJzamdTWkFDWWU=");
                    _secretKey = Encoding.UTF8.GetString(fallbackBytes);
                }
                catch { }
            }

            _publicKey = configuration["PayMongo:PublicKey"] 
                         ?? Environment.GetEnvironmentVariable("PayMongo__PublicKey") 
                         ?? "pk_live_nBF11psok1XbbZwaKSsWKEoL";

            _httpClient.BaseAddress = new Uri("https://api.paymongo.com/v1/");
            var authBytes = Encoding.UTF8.GetBytes($"{_secretKey}:");
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(authBytes));
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        public async Task<PayMongoCheckoutResult> CreateCheckoutSessionAsync(PayMongoCheckoutRequest request)
        {
            try
            {
                // PayMongo expects amount in centavos (PHP 1.00 = 100 centavos)
                long amountInCentavos = (long)Math.Round(request.Amount * 100, MidpointRounding.AwayFromZero);
                if (amountInCentavos < 2000) // minimum PayMongo transaction is 20.00 PHP
                {
                    amountInCentavos = 2000;
                }

                var successUrl = !string.IsNullOrWhiteSpace(request.SuccessUrl) 
                    ? request.SuccessUrl 
                    : "https://mbs-portal.onrender.com/client-payment?status=success";

                var cancelUrl = !string.IsNullOrWhiteSpace(request.CancelUrl) 
                    ? request.CancelUrl 
                    : "https://mbs-portal.onrender.com/client-payment?status=cancelled";

                var payload = new
                {
                    data = new
                    {
                        attributes = new
                        {
                            send_email_receipt = true,
                            show_description = true,
                            show_line_items = true,
                            billing = new
                            {
                                name = request.CustomerName,
                                email = request.CustomerEmail,
                                phone = request.CustomerPhone
                            },
                            line_items = new[]
                            {
                                new
                                {
                                    currency = "PHP",
                                    amount = amountInCentavos,
                                    name = string.IsNullOrWhiteSpace(request.Title) ? "MBS Modular Course Tuition Fee" : request.Title,
                                    quantity = 1,
                                    description = request.Description
                                }
                            },
                            payment_method_types = new[] { "card", "gcash", "paymaya", "dob", "qrph" },
                            description = string.IsNullOrWhiteSpace(request.Description) ? "Mobile Bible School - Modular Tuition Payment" : request.Description,
                            reference_number = request.ReferenceNumber,
                            success_url = successUrl,
                            cancel_url = cancelUrl
                        }
                    }
                };

                var jsonContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync("checkout_sessions", jsonContent);

                var responseBody = await response.Content.ReadAsStringAsync();
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("PayMongo API Error {StatusCode}: {Body}", response.StatusCode, responseBody);
                    return new PayMongoCheckoutResult
                    {
                        Success = false,
                        ErrorMessage = $"PayMongo error: {responseBody}"
                    };
                }

                using var doc = JsonDocument.Parse(responseBody);
                var root = doc.RootElement;
                if (root.TryGetProperty("data", out var dataElem))
                {
                    var id = dataElem.GetProperty("id").GetString();
                    var attributes = dataElem.GetProperty("attributes");
                    var checkoutUrl = attributes.GetProperty("checkout_url").GetString();
                    string? paymentIntentId = null;

                    if (attributes.TryGetProperty("payment_intent", out var piElem) && piElem.TryGetProperty("id", out var piIdElem))
                    {
                        paymentIntentId = piIdElem.GetString();
                    }

                    return new PayMongoCheckoutResult
                    {
                        Success = true,
                        CheckoutUrl = checkoutUrl,
                        CheckoutSessionId = id,
                        PaymentIntentId = paymentIntentId
                    };
                }

                return new PayMongoCheckoutResult
                {
                    Success = false,
                    ErrorMessage = "Invalid response format from PayMongo."
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception while creating PayMongo checkout session");
                return new PayMongoCheckoutResult
                {
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }

        public async Task<PayMongoSessionStatusResult> GetCheckoutSessionAsync(string checkoutSessionId)
        {
            try
            {
                var response = await _httpClient.GetAsync($"checkout_sessions/{checkoutSessionId}");
                var responseBody = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    return new PayMongoSessionStatusResult
                    {
                        Success = false,
                        ErrorMessage = $"Failed to fetch session: {responseBody}"
                    };
                }

                using var doc = JsonDocument.Parse(responseBody);
                var dataElem = doc.RootElement.GetProperty("data");
                var attrs = dataElem.GetProperty("attributes");

                var status = attrs.GetProperty("status").GetString();
                bool isPaid = false;
                decimal amount = 0;
                string? paymentId = null;
                string? paymentMethod = null;

                if (attrs.TryGetProperty("payments", out var paymentsArray) && paymentsArray.GetArrayLength() > 0)
                {
                    var firstPayment = paymentsArray[0];
                    if (firstPayment.TryGetProperty("attributes", out var payAttrs))
                    {
                        var payStatus = payAttrs.GetProperty("status").GetString();
                        isPaid = payStatus == "paid";
                        if (payAttrs.TryGetProperty("amount", out var amtElem))
                        {
                            amount = amtElem.GetInt64() / 100m;
                        }
                        if (payAttrs.TryGetProperty("source", out var srcElem) && srcElem.TryGetProperty("type", out var typeElem))
                        {
                            paymentMethod = typeElem.GetString();
                        }
                        paymentId = firstPayment.GetProperty("id").GetString();
                    }
                }

                return new PayMongoSessionStatusResult
                {
                    Success = true,
                    Status = status,
                    IsPaid = isPaid,
                    Amount = amount,
                    PaymentId = paymentId,
                    PaymentMethod = paymentMethod
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get checkout session status");
                return new PayMongoSessionStatusResult
                {
                    Success = false,
                    ErrorMessage = ex.Message
                };
            }
        }
    }
}
