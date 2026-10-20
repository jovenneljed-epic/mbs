using Microsoft.AspNetCore.Mvc;

namespace School.Api.Authorization
{
    public class RequirePermissionAttribute : TypeFilterAttribute
    {
        public RequirePermissionAttribute(
            string module,
            string action)
            : base(typeof(PermissionFilter))
        {
            Arguments = new object[]
            {
                module,
                action
            };
        }
    }
}
