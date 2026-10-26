namespace School.Api.Models
{
    public class GlobalThemeDto
    {
        public string? ThemeId { get; set; } = "seminary-maroon";
        public string? Name { get; set; } = "Seminary Maroon & 24K Gold";
        public string? Badge { get; set; } = "OFFICIAL MBS";
        public string? Description { get; set; } = "Deep collegiate velvet maroon, lustrous 24K gold accents, and imperial mahogany obsidian.";
        public string? Primary { get; set; } = "#7A1526";
        public string? PrimaryHover { get; set; } = "#580d1b";
        public string? Secondary { get; set; } = "#F59E0B";
        public string? Glow { get; set; } = "rgba(122, 21, 38, 0.42)";
        public string? HeroGlow { get; set; } = "rgba(245, 158, 11, 0.22)";
        public string? HeroBgStart { get; set; } = "#380710";
        public string? HeroBgEnd { get; set; } = "#120205";
        public string? Gradient { get; set; } = "linear-gradient(135deg, #FFFFFF 20%, #FDE68A 65%, #F59E0B 100%)";
        public string? CardAccent { get; set; } = "rgba(122, 21, 38, 0.35)";
    }
}
