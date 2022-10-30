"use strict";
//customer_id, id, name, email, password
exports.up = function (knex /*, Promise*/) {
  return knex.schema.createTable("feeds", function (table) {
    table.engine("Innodb");
    table.charset("UTF8");

    table.increments("id").primary();

    table.string("name", 100).unique().notNull();
    table.string("description").notNull();

    //array_notation
    table.string("url").notNull(); //notation inside array of entries

    table.string("root_notation").notNull(); //notation inside array of entries

    //foreign keys
    table.integer("login_id").unsigned().references("logins.id");

    // Other
    table.timestamps(); // created_at / updated_at
  });
};

exports.down = function (knex /*, Promise*/) {
  return knex.schema.dropTableIfExists("feeds");
};

// DROP TABLE IF EXISTS `feeds`;
/*!40101 SET @saved_cs_client     = @@character_set_client */
/*!50503 SET character_set_client = utf8mb4 */
// CREATE TABLE `feeds` (
//   `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
//   `name` varchar(255) DEFAULT NULL,
//   `description` varchar(1023) NOT NULL,
//   `url` varchar(255) DEFAULT NULL,
//   `array_notation` varchar(255) DEFAULT NULL,
//   `created_at` datetime DEFAULT NULL,
//   `updated_at` datetime DEFAULT NULL,
//   PRIMARY KEY (`id`)
// ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
// /*!40101 SET character_set_client = @saved_cs_client */;

// --
// -- Table structure for table `login`
// --

// DROP TABLE IF EXISTS `logins`;
// /*!40101 SET @saved_cs_client     = @@character_set_client */;
// /*!50503 SET character_set_client = utf8mb4 */;
// CREATE TABLE `logins` (
//     `id` int(10) unsigned NOT NULL AUTO_INCREMENT,

//   `username` varchar(255) DEFAULT NULL,
//   `password` varchar(255) DEFAULT NULL,
//       PRIMARY KEY (`id`)

// ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
