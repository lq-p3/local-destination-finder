FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and csproj files for optimized layer caching
COPY ["Ldf.sln", "./"]
COPY ["Ldf.Api/Ldf.Api.csproj", "Ldf.Api/"]
COPY ["Ldf.Core/Ldf.Core.csproj", "Ldf.Core/"]
COPY ["Ldf.Application/Ldf.Application.csproj", "Ldf.Application/"]
COPY ["Ldf.Infrastructure/Ldf.Infrastructure.csproj", "Ldf.Infrastructure/"]

RUN dotnet restore "Ldf.Api/Ldf.Api.csproj"

# Copy full source and publish
COPY . .
RUN dotnet publish "Ldf.Api/Ldf.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Ldf.Api.dll"]
