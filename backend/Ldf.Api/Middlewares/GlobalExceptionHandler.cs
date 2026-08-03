using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Ldf.Application.Common;

namespace Ldf.Api.Middlewares;

public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
    {
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var traceId = Activity.Current?.Id ?? httpContext.TraceIdentifier;

        var (statusCode, title, code, detail, validationErrors) = MapException(exception);

        _logger.LogError(exception, "Unhandled Exception: {Code} | {Title} | TraceId: {TraceId}", code, title, traceId);

        httpContext.Response.StatusCode = statusCode;

        if (validationErrors != null && validationErrors.Count > 0)
        {
            var valProblem = new ValidationProblemDetails(validationErrors)
            {
                Status = statusCode,
                Title = title,
                Detail = detail,
                Instance = httpContext.Request.Path,
                Type = $"https://ldf.app/errors/{code.ToLower()}"
            };
            valProblem.Extensions["traceId"] = traceId;
            valProblem.Extensions["code"] = code;

            await httpContext.Response.WriteAsJsonAsync(valProblem, cancellationToken);
        }
        else
        {
            var problem = new ProblemDetails
            {
                Status = statusCode,
                Title = title,
                Detail = detail,
                Instance = httpContext.Request.Path,
                Type = $"https://ldf.app/errors/{code.ToLower()}"
            };
            problem.Extensions["traceId"] = traceId;
            problem.Extensions["code"] = code;

            await httpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
        }

        return true;
    }

    private static (int StatusCode, string Title, string Code, string Detail, IDictionary<string, string[]>? Errors) MapException(Exception ex)
    {
        return ex switch
        {
            ValidationException valEx => (
                StatusCodes.Status400BadRequest,
                "Validation Error",
                valEx.Code,
                valEx.Message,
                valEx.Errors
            ),
            ForbiddenException verbEx => (
                StatusCodes.Status403Forbidden,
                "Access Forbidden",
                verbEx.Code,
                verbEx.Message,
                null
            ),
            NotFoundException nfEx => (
                StatusCodes.Status404NotFound,
                "Resource Not Found",
                nfEx.Code,
                nfEx.Message,
                null
            ),
            ConflictException confEx => (
                StatusCodes.Status409Conflict,
                "Operation Conflict",
                confEx.Code,
                confEx.Message,
                null
            ),
            DbUpdateConcurrencyException => (
                StatusCodes.Status409Conflict,
                "Concurrency Conflict",
                "CONCURRENCY_CONFLICT",
                "The resource was modified by another operation. Please reload and try again.",
                null
            ),
            ExternalServiceException extEx => (
                StatusCodes.Status503ServiceUnavailable,
                "External Service Unavailable",
                extEx.Code,
                "An external service failure occurred. Please try again shortly.",
                null
            ),
            UnauthorizedAccessException => (
                StatusCodes.Status401Unauthorized,
                "Unauthorized",
                "UNAUTHORIZED",
                "Authentication required to perform this request.",
                null
            ),
            _ => (
                StatusCodes.Status500InternalServerError,
                "Internal Server Error",
                "INTERNAL_SERVER_ERROR",
                "An unexpected server error occurred. Please contact support with the trace ID.",
                null
            )
        };
    }
}
