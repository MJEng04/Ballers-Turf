namespace starter_code.Middleware;

public class RedirectRootMiddleware
{
    private readonly RequestDelegate _next;

    public RedirectRootMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path == "/")
        {
            context.Response.Redirect("/index.html");
            return;
        }

        await _next(context);
    }
}

public static class RedirectRootMiddlewareExtensions
{
    public static IApplicationBuilder UseRedirectRoot(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<RedirectRootMiddleware>();
    }
}