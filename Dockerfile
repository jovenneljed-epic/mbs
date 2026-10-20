FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

# Copy project files first for fast layer caching
COPY School.Core/School.Core.csproj School.Core/
COPY School.Api/School.Api.csproj School.Api/

# Restore dependencies
RUN dotnet restore School.Api/School.Api.csproj

# Copy remaining source code
COPY School.Core/ School.Core/
COPY School.Api/ School.Api/

# Publish Release
RUN dotnet publish School.Api/School.Api.csproj \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 10000

ENTRYPOINT ["dotnet", "School.Api.dll"]
