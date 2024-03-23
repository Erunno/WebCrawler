using System;
using Microsoft.EntityFrameworkCore.Migrations;
using MySql.EntityFrameworkCore.Metadata;

#nullable disable

namespace WebCrawler.Migrations
{
    /// <inheritdoc />
    public partial class init : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "WebSiteRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    Url = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    BoundaryRegExp = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    PeriodicityMinutes = table.Column<int>(type: "int", nullable: false),
                    Label = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false),
                    IsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    Tags = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WebSiteRecords", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "Executions",
                columns: table => new
                {
                    ExecutionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySQL:ValueGenerationStrategy", MySQLValueGenerationStrategy.IdentityColumn),
                    StartTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    EndTime = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    SitesCrawled = table.Column<int>(type: "int", nullable: false),
                    SiteRecordId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Executions", x => x.ExecutionId);
                    table.ForeignKey(
                        name: "FK_Executions_WebSiteRecords_SiteRecordId",
                        column: x => x.SiteRecordId,
                        principalTable: "WebSiteRecords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySQL:Charset", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Executions_SiteRecordId",
                table: "Executions",
                column: "SiteRecordId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Executions");

            migrationBuilder.DropTable(
                name: "WebSiteRecords");
        }
    }
}
