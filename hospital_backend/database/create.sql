
CREATE TABLE "Patients" (
  "id"	INTEGER NOT NULL UNIQUE,
	"oib"	TEXT NOT NULL,
	"firstName"	TEXT NOT NULL,
	"lastName"	TEXT NOT NULL,
	"birthDate"	TEXT NOT NULL,
	"healthData"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
