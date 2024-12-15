
CREATE TABLE "Patients" (
  "id" INTEGER NOT NULL UNIQUE,
  "aid" INTEGER NOT NULL,
	"oib" TEXT NOT NULL,
	"firstName" TEXT NOT NULL,
	"lastName" TEXT NOT NULL,
	"birthDate" TEXT NOT NULL,
	"healthDataPaillier" TEXT NOT NULL DEFAULT '',
  "healthDataSeal" TEXT NOT NULL DEFAULT '',
	PRIMARY KEY("id" AUTOINCREMENT)
);

INSERT INTO "Patients" (aid, oib, firstName, lastName, birthDate) VALUES
  ('4911', '10100', 'Bruno', 'Brunić', "2000-01-01"),
  ('6204', '10200', 'Maja', 'Majić', "2000-01-02"),
  ('8591', '10300', 'Tanja', 'Tanjić', "2000-01-03"),
  ('1285', '10400', 'Zoran', 'Zorić', "2000-01-04");
