using System;
using System.Collections.Generic;

namespace Ldf.Application.Common;

public class NotFoundException : Exception
{
    public string Code { get; }

    public NotFoundException(string message, string code = "NOT_FOUND") : base(message)
    {
        Code = code;
    }
}

public class ConflictException : Exception
{
    public string Code { get; }

    public ConflictException(string message, string code = "CONFLICT") : base(message)
    {
        Code = code;
    }
}

public class ValidationException : Exception
{
    public string Code { get; }
    public IDictionary<string, string[]> Errors { get; }

    public ValidationException(string message, IDictionary<string, string[]>? errors = null, string code = "VALIDATION_ERROR") : base(message)
    {
        Code = code;
        Errors = errors ?? new Dictionary<string, string[]>();
    }
}

public class ForbiddenException : Exception
{
    public string Code { get; }

    public ForbiddenException(string message, string code = "FORBIDDEN") : base(message)
    {
        Code = code;
    }
}

public class ExternalServiceException : Exception
{
    public string Code { get; }

    public ExternalServiceException(string message, string code = "EXTERNAL_SERVICE_ERROR") : base(message)
    {
        Code = code;
    }
}
