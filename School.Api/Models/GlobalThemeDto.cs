namespace School.Api.Models
{
    public class GlobalThemeDto
    {
        public string? ThemeId { get; set; } = "seminary-maroon";
        public string? Name { get; set; } = "Seminary Maroon & Gold";
        public string? Badge { get; set; } = "OFFICIAL MBS";
        public string? Description { get; set; } = "Prestigious institutional deep maroon with academic gold accents & collegiate ivory backdrop.";
        public string? Primary { get; set; } = "#7A1526";
        public string? PrimaryHover { get; set; } = "#580d1b";
        public string? Secondary { get; set; } = "#F59E0B";
        public string? Glow { get; set; } = "rgba(122, 21, 38, 0.35)";
        public string? HeroGlow { get; set; } = "rgba(122, 21, 38, 0.2)";
        public string? HeroBgStart { get; set; } = "#3c0812";
        public string? HeroBgEnd { get; set; } = "#1a0408";
        public string? Gradient { get; set; } = "linear-gradient(180deg, #ffffff 20%, #fde68a 65%, #f59e0b 100%)";
        public string? CardAccent { get; set; } = "rgba(122, 21, 38, 0.2)";
    }
}
