namespace School.Api.Models
{
    public class GlobalThemeDto
    {
        public string? ThemeId { get; set; } = "emerald-academic";
        public string? Name { get; set; } = "Living Word Emerald";
        public string? Badge { get; set; } = "OFFICIAL MBS";
        public string? Description { get; set; } = "Deep botanical forest greens & bright mint symbolizing spiritual fruitfulness and life.";
        public string? Primary { get; set; } = "#10b981";
        public string? PrimaryHover { get; set; } = "#059669";
        public string? Secondary { get; set; } = "#34d399";
        public string? Glow { get; set; } = "rgba(16, 185, 129, 0.35)";
        public string? HeroGlow { get; set; } = "rgba(16, 185, 129, 0.16)";
        public string? HeroBgStart { get; set; } = "#020f0a";
        public string? HeroBgEnd { get; set; } = "#051b12";
        public string? Gradient { get; set; } = "linear-gradient(180deg, #ffffff 20%, #a7f3d0 65%, #10b981 100%)";
        public string? CardAccent { get; set; } = "rgba(16, 185, 129, 0.2)";
    }
}
