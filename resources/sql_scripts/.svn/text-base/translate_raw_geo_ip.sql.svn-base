TRUNCATE TABLE country;
TRUNCATE TABLE ip_range;
TRUNCATE TABLE region;

INSERT INTO region(name) VALUES('North America'), ('International');

SELECT @ls_id:=max(pk_id) FROM localized_strings;

INSERT INTO localized_strings(en) SELECT DISTINCT name FROM raw_geo_ip_data;
INSERT INTO country(country_code, fk_region_id, fk_country_string_id) SELECT DISTINCT rg.country, 2, ls.pk_id FROM raw_geo_ip_data rg INNER JOIN localized_strings ls ON (rg.name=ls.en AND ls.pk_id>@ls_id);

UPDATE country SET fk_region_id=1 WHERE country_code IN('US', 'CA', 'MX');

INSERT INTO ip_range SELECT begin_num, end_num, country FROM raw_geo_ip_data;