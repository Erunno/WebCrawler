FROM mysql:latest AS mysql
ENV MYSQL_ROOT_PASSWORD=passwd
ENV MYSQL_DATABASE=WebCrawlerDb
ENV MYSQL_USER=root
ENV MYSQL_PASSWORD=passwd

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER app
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["WebCrawler/WebCrawler.csproj", "WebCrawler/"]
RUN dotnet restore "./WebCrawler/./WebCrawler.csproj"
COPY . .
WORKDIR "/src/WebCrawler"
RUN dotnet build "./WebCrawler.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./WebCrawler.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "WebCrawler.dll"]