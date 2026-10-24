using Resend;

namespace School.Api.Services
{
    public class ResendEmailService
    {
        private readonly IResend _resend;
        private readonly IConfiguration _configuration;

        public ResendEmailService(
            IResend resend,
            IConfiguration configuration)
        {
            _resend = resend;
            _configuration = configuration;
        }

        // =====================================================
        // COMMON EMAIL SENDER
        // =====================================================

        public async Task SendEmailAsync(
            string recipientEmail,
            string subject,
            string htmlBody)
        {
            var fromEmail = _configuration["Resend:FromEmail"];

            if (string.IsNullOrWhiteSpace(fromEmail))
            {
                throw new InvalidOperationException(
                    "Resend FromEmail is not configured.");
            }

            if (string.IsNullOrWhiteSpace(recipientEmail))
            {
                throw new ArgumentException(
                    "Recipient email is required.",
                    nameof(recipientEmail));
            }

            var message = new EmailMessage
            {
                From = fromEmail,
                Subject = subject,
                HtmlBody = htmlBody
            };

            message.To.Add(recipientEmail);

            await _resend.EmailSendAsync(message);
        }


        // =====================================================
        // SEND INQUIRY & CONTACT CONFIRMATION TO REQUESTER
        // Official Mobile Bible School & Theological Seminary
        // =====================================================

        public async Task SendInquiryConfirmationAsync(
            string fullName,
            string email,
            string churchName,
            string? position = null,
            string? messageText = null,
            int inquiryId = 0)
        {
            try
            {
                var safeCategory = string.IsNullOrWhiteSpace(position) ? "General Academic Inquiry" : position;
                var safeOrg = string.IsNullOrWhiteSpace(churchName) ? "Independent / General Public" : churchName;
                var safeMsg = string.IsNullOrWhiteSpace(messageText) ? "No detailed message provided." : messageText;
                var refCode = inquiryId > 0 ? $"MBS-INQ-{inquiryId:D5}" : $"MBS-INQ-{DateTime.UtcNow:yyyyMMdd}";

                var html = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Inquiry Acknowledgment - Mobile Bible School</title>
</head>
<body style='
    margin: 0;
    padding: 30px 15px;
    background-color: #0F172A;
    font-family: -apple-system, BlinkMacSystemFont, ""Segoe UI"", Roboto, Helvetica, Arial, sans-serif;
    color: #1E293B;
'>

<div style='
    max-width: 640px;
    margin: auto;
    background: #FFFFFF;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(245, 158, 11, 0.35);
'>

    <!-- HEADER BRANDING -->
    <div style='
        background: linear-gradient(135deg, #7A1526 0%, #450A0A 60%, #1A0408 100%);
        border-bottom: 3px solid #F59E0B;
        padding: 36px 30px;
        text-align: center;
        color: #FFFFFF;
    '>
        <div style='
            display: inline-block;
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
            border-radius: 50%;
            line-height: 48px;
            font-size: 24px;
            margin-bottom: 12px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        '>📖</div>
        <h1 style='
            margin: 0;
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -0.01em;
            color: #FFFFFF;
        '>
            Mobile Bible School
        </h1>
        <p style='
            margin: 6px 0 0 0;
            color: #FDE68A;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        '>
            Theological Seminary &amp; Academic Institute
        </p>
    </div>

    <!-- BODY CONTENT -->
    <div style='padding: 32px 28px;'>
        <div style='
            background: #FEF3C7;
            border-left: 4px solid #D97706;
            padding: 10px 14px;
            border-radius: 6px;
            margin-bottom: 24px;
            font-size: 13px;
            color: #78350F;
            font-weight: 600;
        '>
            Official Inquiry Tracking Code: <strong>{refCode}</strong>
        </div>

        <h2 style='
            color: #0F172A;
            font-size: 20px;
            margin: 0 0 12px 0;
            font-weight: 800;
        '>
            Hello, {System.Net.WebUtility.HtmlEncode(fullName)}!
        </h2>

        <p style='
            font-size: 15px;
            line-height: 1.6;
            color: #334155;
            margin: 0 0 20px 0;
        '>
            Thank you for reaching out to <strong>Mobile Bible School &amp; Theological Seminary</strong>. We have officially received your message and recorded it into our campus communication database.
        </p>

        <!-- INQUIRY DETAILS CARD -->
        <div style='
            background: #F8FAFC;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
        '>
            <h3 style='
                margin: 0 0 14px 0;
                font-size: 14px;
                color: #7A1526;
                text-transform: uppercase;
                letter-spacing: 0.04em;
                font-weight: 800;
            '>
                Inquiry Summary
            </h3>

            <table style='width: 100%; border-collapse: collapse; font-size: 14px;'>
                <tr>
                    <td style='padding: 6px 0; color: #64748B; width: 140px; font-weight: 600;'>Category:</td>
                    <td style='padding: 6px 0; color: #0F172A; font-weight: 700;'>{System.Net.WebUtility.HtmlEncode(safeCategory)}</td>
                </tr>
                <tr>
                    <td style='padding: 6px 0; color: #64748B; font-weight: 600;'>Affiliation:</td>
                    <td style='padding: 6px 0; color: #0F172A;'>{System.Net.WebUtility.HtmlEncode(safeOrg)}</td>
                </tr>
                <tr>
                    <td style='padding: 6px 0; color: #64748B; font-weight: 600;'>Date Received:</td>
                    <td style='padding: 6px 0; color: #0F172A;'>{DateTime.UtcNow:MMMM dd, yyyy • hh:mm tt} UTC</td>
                </tr>
            </table>

            <div style='
                margin-top: 14px;
                padding-top: 14px;
                border-top: 1px dashed #CBD5E1;
            '>
                <span style='display: block; font-size: 12px; color: #64748B; font-weight: 700; text-transform: uppercase; margin-bottom: 4px;'>Your Message:</span>
                <p style='margin: 0; font-size: 14px; color: #1E293B; line-height: 1.5; font-style: italic;'>
                    ""{System.Net.WebUtility.HtmlEncode(safeMsg)}""
                </p>
            </div>
        </div>

        <h3 style='font-size: 15px; color: #0F172A; margin: 0 0 10px 0; font-weight: 700;'>
            Next Steps:
        </h3>
        <p style='font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;'>
            Our <strong>Admissions Directorate &amp; Faculty Registrar</strong> reviews all inquiries promptly. An admissions counselor will respond to you via email or phone within <strong>24 to 48 business hours</strong>.
        </p>

        <!-- CONTACT INFORMATION -->
        <div style='
            background: #F1F5F9;
            border-radius: 8px;
            padding: 16px;
            font-size: 13px;
            color: #475569;
            line-height: 1.6;
        '>
            <strong>Campus Desk &amp; Admissions Hotline:</strong><br />
            📧 Email: <a href='mailto:admissions@mobilebibleschool.edu' style='color: #7A1526; text-decoration: none; font-weight: 700;'>admissions@mobilebibleschool.edu</a><br />
            🌐 Website: <a href='https://mbs-portal.onrender.com' style='color: #7A1526; text-decoration: none;'>https://mbs-portal.onrender.com</a><br />
            📍 Main Campus: Mobile Bible School &amp; Theological Seminary, Philippines
        </div>
    </div>

    <!-- FOOTER -->
    <div style='
        background: #0F172A;
        color: #94A3B8;
        padding: 20px 28px;
        text-align: center;
        font-size: 12px;
        border-top: 1px solid rgba(255,255,255,0.08);
    '>
        <p style='margin: 0 0 4px 0; color: #E2E8F0; font-weight: 700;'>
            Mobile Bible School &amp; Theological Seminary
        </p>
        <p style='margin: 0; color: #64748B;'>
            Equipping Disciples • Advancing Theological Scholarship • Proclaiming Truth
        </p>
    </div>

</div>

</body>
</html>";

                await SendEmailAsync(
                    email,
                    $"[MBS Acknowledgment] We have received your inquiry: {refCode}",
                    html);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Failed to send MBS inquiry confirmation email: " + ex.Message);
            }
        }

        // =====================================================
        // SEND DEMO REQUEST CONFIRMATION TO REQUESTER (Backward Compatibility)
        // =====================================================

        public async Task SendDemoRequestConfirmationAsync(
            string fullName,
            string email,
            string churchName)
        {
            await SendInquiryConfirmationAsync(
                fullName,
                email,
                churchName,
                "Campus Demonstration / Academic Admissions",
                null,
                0);
        }

        // =====================================================
        // SEND NEW DEMO REQUEST NOTIFICATION TO ADMIN
        // =====================================================

        public async Task SendNewDemoRequestAdminNotificationAsync(
            string fullName,
            string email,
            string churchName,
            string? phone,
            string? position,
            string? messageText,
            int demoRequestId)
        {
            try
            {
                var adminEmail = _configuration["Resend:AdminEmail"];

                if (string.IsNullOrWhiteSpace(adminEmail))
                {
                    adminEmail = "jovenneljed@gmail.com";
                }

                var safePhone = string.IsNullOrWhiteSpace(phone) ? "Not provided" : phone;
                var safePosition = string.IsNullOrWhiteSpace(position) ? "General Inquiry" : position;
                var safeMessage = string.IsNullOrWhiteSpace(messageText) ? "No message provided." : messageText;
                var refCode = $"MBS-INQ-{demoRequestId:D5}";

                var html = $@"
<!DOCTYPE html>
<html>
<body style='
    margin: 0;
    padding: 30px;
    background-color: #f5f7fb;
    font-family: Arial, sans-serif;
'>

<div style='
    max-width: 650px;
    margin: auto;
    background: #ffffff;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    border: 1px solid rgba(245, 158, 11, 0.4);
'>

    <div style='
        background: linear-gradient(135deg, #7A1526 0%, #450A0A 100%);
        border-bottom: 3px solid #F59E0B;
        color: white;
        padding: 25px 30px;
    '>
        <h1 style='margin: 0; font-size: 24px; color: #FFFFFF;'>
            🔔 New MBS Campus Inquiry ({refCode})
        </h1>
        <p style='margin: 6px 0 0 0; color: #FDE68A; font-weight: bold;'>
            Mobile Bible School &amp; Theological Seminary • Inquiries Desk
        </p>
    </div>

    <div style='padding: 30px;'>
        <h2 style='color: #7A1526; margin-top: 0;'>
            A new inquiry has been submitted through the public website.
        </h2>

        <div style='background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 20px 0;'>
            <table style='width: 100%; border-collapse: collapse; font-size: 14px;'>
                <tr>
                    <td style='padding: 6px 0; color: #64748B; width: 140px;'><strong>Tracking ID:</strong></td>
                    <td style='padding: 6px 0; color: #7A1526; font-weight: bold;'>{refCode}</td>
                </tr>
                <tr>
                    <td style='padding: 6px 0; color: #64748B;'><strong>Full Name:</strong></td>
                    <td style='padding: 6px 0; color: #0F172A; font-weight: bold;'>{System.Net.WebUtility.HtmlEncode(fullName)}</td>
                </tr>
                <tr>
                    <td style='padding: 6px 0; color: #64748B;'><strong>Email:</strong></td>
                    <td style='padding: 6px 0; color: #0F172A;'><a href='mailto:{email}' style='color: #7A1526;'>{email}</a></td>
                </tr>
                <tr>
                    <td style='padding: 6px 0; color: #64748B;'><strong>Phone:</strong></td>
                    <td style='padding: 6px 0; color: #0F172A;'>{System.Net.WebUtility.HtmlEncode(safePhone)}</td>
                </tr>
                <tr>
                    <td style='padding: 6px 0; color: #64748B;'><strong>Affiliation:</strong></td>
                    <td style='padding: 6px 0; color: #0F172A;'>{System.Net.WebUtility.HtmlEncode(churchName)}</td>
                </tr>
                <tr>
                    <td style='padding: 6px 0; color: #64748B;'><strong>Category:</strong></td>
                    <td style='padding: 6px 0; color: #0F172A; font-weight: bold;'>{System.Net.WebUtility.HtmlEncode(safePosition)}</td>
                </tr>
            </table>

            <div style='margin-top: 14px; padding-top: 14px; border-top: 1px solid #CBD5E1;'>
                <strong style='color: #475569; font-size: 12px; text-transform: uppercase;'>Inquiry Message:</strong>
                <p style='margin: 6px 0 0 0; color: #1E293B; line-height: 1.5;'>
                    {System.Net.WebUtility.HtmlEncode(safeMessage)}
                </p>
            </div>
        </div>

        <p style='color: #64748B; font-size: 13px;'>
            You can manage this inquiry and resend auto-confirmation emails directly from the <strong>Inquiries &amp; Contact Management</strong> module in the admin dashboard.
        </p>
    </div>

</div>

</body>
</html>";

                await SendEmailAsync(
                    adminEmail,
                    $"[New MBS Inquiry #{demoRequestId}] from {fullName} - {safePosition}",
                    html);
            }
            catch (Exception ex)
            {
                Console.WriteLine("Failed to send admin inquiry notification: " + ex.Message);
            }
        }


        // =====================================================
        // DEMO REQUEST - CONTACTED
        // =====================================================

        public async Task SendDemoRequestContactedAsync(
            string email,
            string fullName,
            string churchName)
        {
            try
            {
                var html = BuildStatusEmail(
                    title: "We Have Contacted You",
                    heading: "Your EPIC CMS Demo Request Has Been Updated",
                    fullName: fullName,
                    churchName: churchName,
                    status: "Contacted",
                    statusColor: "#2563eb",
                    statusBackground: "#dbeafe",
                    message:
                        "Our EPIC team has contacted you regarding your demo request. " +
                        "Thank you for your interest in EPIC Church Management System.");

                await SendEmailAsync(
                    email,
                    "EPIC CMS Demo Request – Contacted",
                    html);
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    "Failed to send contacted demo request email:");

                Console.WriteLine(ex.Message);
            }
        }


        // =====================================================
        // DEMO REQUEST - SCHEDULED
        // =====================================================

        public async Task SendDemoRequestScheduledAsync(
      string email,
      string fullName,
      string churchName,
      DateTime? scheduledDate)
        {
            try
            {
                var formattedDate =
      scheduledDate.HasValue
          ? scheduledDate.Value.ToString("MMMM dd, yyyy hh:mm tt")
          : "To be determined";

                var html = BuildStatusEmail(
                    title: "Demo Scheduled",
                    heading: "Your EPIC CMS Demo Has Been Scheduled",
                    fullName: fullName,
                    churchName: churchName,
                    status: "Scheduled",
                    statusColor: "#047857",
                    statusBackground: "#d1fae5",
                    message:
                        $"Your EPIC CMS demo has been scheduled for " +
                        $"<strong>{formattedDate}</strong>.<br /><br />" +
                        "We look forward to demonstrating how EPIC CMS " +
                        "can help your church manage its operations more efficiently.");

                await SendEmailAsync(
                    email,
                    "EPIC CMS Demo Scheduled",
                    html);
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    "Failed to send scheduled demo request email:");

                Console.WriteLine(ex.Message);
            }
        }


        // =====================================================
        // DEMO REQUEST - COMPLETED
        // =====================================================

        public async Task SendDemoRequestCompletedAsync(
            string email,
            string fullName,
            string churchName)
        {
            try
            {
                var html = BuildStatusEmail(
                    title: "Demo Completed",
                    heading: "Thank You for Attending the EPIC CMS Demo",
                    fullName: fullName,
                    churchName: churchName,
                    status: "Completed",
                    statusColor: "#15803d",
                    statusBackground: "#dcfce7",
                    message:
                        "Thank you for taking the time to attend the EPIC CMS demo. " +
                        "We hope the demonstration helped you see how EPIC can " +
                        "support your church's ministry and administrative needs.");

                await SendEmailAsync(
                    email,
                    "EPIC CMS Demo Completed – Thank You",
                    html);
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    "Failed to send completed demo request email:");

                Console.WriteLine(ex.Message);
            }
        }


        // =====================================================
        // DEMO REQUEST - CANCELLED
        // =====================================================

        public async Task SendDemoRequestCancelledAsync(
            string email,
            string fullName,
            string churchName)
        {
            try
            {
                var html = BuildStatusEmail(
                    title: "Demo Request Cancelled",
                    heading: "Your EPIC CMS Demo Request Has Been Cancelled",
                    fullName: fullName,
                    churchName: churchName,
                    status: "Cancelled",
                    statusColor: "#b91c1c",
                    statusBackground: "#fee2e2",
                    message:
                        "Your EPIC CMS demo request has been cancelled. " +
                        "If you would like to schedule another demonstration " +
                        "in the future, please submit a new demo request.");

                await SendEmailAsync(
                    email,
                    "EPIC CMS Demo Request – Cancelled",
                    html);
            }
            catch (Exception ex)
            {
                Console.WriteLine(
                    "Failed to send cancelled demo request email:");

                Console.WriteLine(ex.Message);
            }
        }


        // =====================================================
        // SUBSCRIPTION / PAYMENT NOTIFICATIONS
        // =====================================================

        public async Task SendSubscriptionCreatedAsync(
            string email, string contactName, string churchName,
            string planName, string billingCycle, decimal amount,
            int subscriptionId, string status)
        {
            var safeName = System.Net.WebUtility.HtmlEncode(contactName);
            var safeChurch = System.Net.WebUtility.HtmlEncode(churchName);
            var safePlan = System.Net.WebUtility.HtmlEncode(planName);
            var safeStatus = System.Net.WebUtility.HtmlEncode(status);
            var html = BuildTransactionEmail(
                "EPIC Subscription Received",
                $"Hello {safeName},",
                $"We received your EPIC subscription request for <strong>{safeChurch}</strong>.",
                $"Subscription #{subscriptionId} is currently <strong>{safeStatus}</strong> while payment is being reviewed.",
                $"Plan: <strong>{safePlan}</strong><br/>Billing: <strong>{billingCycle}</strong><br/>Amount: <strong>PHP {amount:N2}</strong>");
            await SafeSendAsync(email, "EPIC Subscription Request Received", html);
        }

        public async Task SendPaymentSubmittedAsync(
            string email, string contactName, string churchName,
            string planName, decimal amount, string currency,
            int paymentId, int subscriptionId, string paymentMethod, string? reference)
        {
            var safeName = System.Net.WebUtility.HtmlEncode(contactName);
            var safeChurch = System.Net.WebUtility.HtmlEncode(churchName);
            var safePlan = System.Net.WebUtility.HtmlEncode(planName);
            var safeMethod = System.Net.WebUtility.HtmlEncode(paymentMethod);
            var safeRef = System.Net.WebUtility.HtmlEncode(reference ?? "Not provided");
            var html = BuildTransactionEmail(
                "EPIC Payment Submitted",
                $"Hello {safeName},",
                $"Your payment submission for <strong>{safeChurch}</strong> has been received.",
                $"Payment #{paymentId} is <strong>PENDING</strong>. Our administration team will verify your payment before activation.",
                $"Subscription: <strong>#{subscriptionId}</strong><br/>Plan: <strong>{safePlan}</strong><br/>Amount: <strong>{currency} {amount:N2}</strong><br/>Method: <strong>{safeMethod}</strong><br/>Reference: <strong>{safeRef}</strong>");
            await SafeSendAsync(email, "EPIC Payment Submitted – Pending Verification", html);
        }

        public async Task SendPaymentStatusNotificationAsync(
            int paymentId, int subscriptionId, string email, string contactName,
            string churchName, string planName, string billingCycle, decimal amount,
            string currency, string status, string? reference)
        {
            var safeStatus = System.Net.WebUtility.HtmlEncode(status);
            var subject = status switch
            {
                "PAID" => "EPIC Payment Verified – Subscription Activated",
                "FAILED" => "EPIC Payment Update – Action Required",
                "REFUNDED" => "EPIC Payment Refunded – Subscription Update",
                _ => $"EPIC Payment Update – {safeStatus}"
            };
            var message = status == "PAID"
                ? "Your payment has been verified. Your EPIC subscription is now active."
                : status == "FAILED"
                    ? "Your payment could not be approved. Please contact EPIC administration or submit a new payment."
                    : status == "REFUNDED"
                        ? "Your payment was refunded and your subscription has been moved to past due."
                        : $"Your payment status is now <strong>{safeStatus}</strong>.";
            var safeName = System.Net.WebUtility.HtmlEncode(contactName);
            var safeChurch = System.Net.WebUtility.HtmlEncode(churchName);
            var safePlan = System.Net.WebUtility.HtmlEncode(planName);
            var safeRef = System.Net.WebUtility.HtmlEncode(reference ?? "Not provided");
            var html = BuildTransactionEmail(
                "EPIC Payment Status Update",
                $"Hello {safeName},",
                $"This is an update for <strong>{safeChurch}</strong>.",
                message,
                $"Payment: <strong>#{paymentId}</strong><br/>Subscription: <strong>#{subscriptionId}</strong><br/>Plan: <strong>{safePlan}</strong><br/>Billing: <strong>{billingCycle}</strong><br/>Amount: <strong>{currency} {amount:N2}</strong><br/>Reference: <strong>{safeRef}</strong>");
            await SafeSendAsync(email, subject, html);
        }

        private async Task SafeSendAsync(string email, string subject, string html)
        {
            try { await SendEmailAsync(email, subject, html); }
            catch (Exception ex)
            {
                Console.WriteLine($"EPIC email notification failed: {ex.Message}");
            }
        }

        private static string BuildTransactionEmail(string title, string greeting, string intro, string message, string details)
        {
            return $@"<!DOCTYPE html><html><body style='margin:0;padding:30px;background:#f5f7fb;font-family:Arial,sans-serif;'>
<div style='max-width:620px;margin:auto;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,.08);'>
<div style='background:#0f172a;color:#fff;padding:26px 30px;'><h1 style='margin:0;color:#38bdf8;'>EPIC</h1><p style='margin:6px 0 0;opacity:.9;'>Engaging People Into Christ</p></div>
<div style='padding:30px;'><h2 style='color:#1e3a8a;'>{title}</h2><p>{greeting}</p><p>{intro}</p><div style='padding:18px;background:#f1f5f9;border-radius:10px;line-height:1.8;'>{details}</div><p style='margin-top:22px;'>{message}</p><p>God bless your ministry!</p><p><strong>EPIC Team</strong><br/>EPIC Church Management System</p><hr style='border:0;border-top:1px solid #e5e7eb;margin:28px 0;'><small style='color:#64748b;'>This is an automatic email from the EPIC Church Management System.</small></div></div></body></html>";
        }

        public async Task SendNewSubscriptionAdminNotificationAsync(
            string churchName, string contactName, string email, string phone,
            string planName, string billingCycle, decimal amount, int subscriptionId)
        {
            try
            {
                var admin = _configuration["Resend:AdminEmail"];
                if (string.IsNullOrWhiteSpace(admin)) return;
                var html = BuildTransactionEmail(
                    "New EPIC Subscription",
                    "A new subscription checkout was completed.",
                    $"<strong>{System.Net.WebUtility.HtmlEncode(churchName)}</strong> submitted an EPIC subscription request.",
                    "The subscription is waiting for payment verification.",
                    $"Subscription: <strong>#{subscriptionId}</strong><br/>Contact: <strong>{System.Net.WebUtility.HtmlEncode(contactName)}</strong><br/>Email: <strong>{System.Net.WebUtility.HtmlEncode(email)}</strong><br/>Phone: <strong>{System.Net.WebUtility.HtmlEncode(phone)}</strong><br/>Plan: <strong>{System.Net.WebUtility.HtmlEncode(planName)}</strong><br/>Billing: <strong>{System.Net.WebUtility.HtmlEncode(billingCycle)}</strong><br/>Amount: <strong>PHP {amount:N2}</strong>");
                await SafeSendAsync(admin, $"New EPIC Subscription #{subscriptionId}", html);
            }
            catch (Exception ex) { Console.WriteLine($"Admin subscription email failed: {ex.Message}"); }
        }

        public async Task SendNewPaymentAdminNotificationAsync(
            int paymentId, int subscriptionId, string churchName, string planName,
            decimal amount, string currency, string paymentMethod, string? reference)
        {
            try
            {
                var admin = _configuration["Resend:AdminEmail"];
                if (string.IsNullOrWhiteSpace(admin)) return;
                var html = BuildTransactionEmail(
                    "New EPIC Payment Awaiting Verification",
                    "A new payment proof has been submitted.",
                    $"<strong>{System.Net.WebUtility.HtmlEncode(churchName)}</strong> submitted a payment for review.",
                    "Open EPIC Payment Management to review the proof and mark the payment as paid or failed.",
                    $"Payment: <strong>#{paymentId}</strong><br/>Subscription: <strong>#{subscriptionId}</strong><br/>Plan: <strong>{System.Net.WebUtility.HtmlEncode(planName)}</strong><br/>Amount: <strong>{currency} {amount:N2}</strong><br/>Method: <strong>{System.Net.WebUtility.HtmlEncode(paymentMethod)}</strong><br/>Reference: <strong>{System.Net.WebUtility.HtmlEncode(reference ?? "Not provided")}</strong>");
                await SafeSendAsync(admin, $"Payment Verification Required #{paymentId}", html);
            }
            catch (Exception ex) { Console.WriteLine($"Admin payment email failed: {ex.Message}"); }
        }

        // =====================================================
        // STATUS EMAIL TEMPLATE
        // =====================================================

        private static string BuildStatusEmail(
            string title,
            string heading,
            string fullName,
            string churchName,
            string status,
            string statusColor,
            string statusBackground,
            string message)
        {
            return $@"
<!DOCTYPE html>
<html>

<body style='
    margin: 0;
    padding: 30px;
    background-color: #f5f7fb;
    font-family: Arial, sans-serif;
'>

<div style='
    max-width: 600px;
    margin: auto;
    background: #ffffff;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 4px 15px rgba(0,0,0,0.08);
'>

    <div style='
        background-color: #1e3a8a;
        color: white;
        padding: 25px 30px;
    '>

        <h1 style='
            margin: 0;
            font-size: 26px;
        '>
            EPIC
        </h1>

        <p style='
            margin: 8px 0 0 0;
            opacity: 0.9;
        '>
            Engaging People Into Christ
        </p>

    </div>

    <div style='padding: 30px;'>

        <h2 style='color: #1e3a8a;'>
            {heading}
        </h2>

        <p>
            Hello <strong>{fullName}</strong>,
        </p>

        <p>
            This is an update regarding your EPIC CMS demo request
            for <strong>{churchName}</strong>.
        </p>

        <div style='
            margin: 25px 0;
            padding: 15px 20px;
            background: {statusBackground};
            border-radius: 8px;
            color: {statusColor};
        '>

            <strong>
                Status: {status}
            </strong>

        </div>

        <p>
            {message}
        </p>

        <p>
            If you have any questions, please feel free to contact
            the EPIC team.
        </p>

        <p>
            God bless your ministry!
        </p>

        <p>
            <strong>EPIC Team</strong>
            <br />
            Engaging People Into Christ
        </p>

        <hr style='
            border: 0;
            border-top: 1px solid #e5e7eb;
            margin: 30px 0;
        '>

        <p style='
            color: #64748b;
            font-size: 13px;
        '>
            This is an automatic email from the
            EPIC Church Management System.
        </p>

    </div>

</div>

</body>
</html>";
        }
    }
}