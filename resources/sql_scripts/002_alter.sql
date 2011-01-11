SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL';

DROP SCHEMA IF EXISTS `vouchr` ;

CREATE SCHEMA IF NOT EXISTS `vouchr` DEFAULT CHARACTER SET utf8 COLLATE utf8_swedish_ci ;

USE `vouchr`;

CREATE  TABLE IF NOT EXISTS `vouchr`.`user` (
  `pk_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT ,
  `fk_region_id` INT(10) UNSIGNED NOT NULL ,
  `email` VARCHAR(255) NOT NULL ,
  `password` CHAR(64) NOT NULL ,
  `first_name` VARCHAR(45) NOT NULL DEFAULT '' ,
  `last_name` VARCHAR(45) NOT NULL DEFAULT '' ,
  `deleted` BIT(1) NOT NULL DEFAULT 0 ,
  PRIMARY KEY (`pk_id`) ,
  INDEX `login` (`email` ASC, `password` ASC) ,
  INDEX `user_fk_region_id__region_pk_id` (`pk_id` ASC) ,
  CONSTRAINT `user_fk_region_id__region_pk_id`
    FOREIGN KEY (`pk_id` )
    REFERENCES `vouchr`.`region` (`pk_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_swedish_ci;

CREATE  TABLE IF NOT EXISTS `vouchr`.`user_group` (
  `pk_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(45) NOT NULL DEFAULT '' ,
  PRIMARY KEY (`pk_id`) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_swedish_ci;

CREATE  TABLE IF NOT EXISTS `vouchr`.`api_name` (
  `pk_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(255) NOT NULL DEFAULT '' ,
  PRIMARY KEY (`pk_id`) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_swedish_ci;

CREATE  TABLE IF NOT EXISTS `vouchr`.`map_user_group` (
  `fk_user_id` INT(10) UNSIGNED NOT NULL ,
  `fk_group_id` INT(10) UNSIGNED NOT NULL ,
  PRIMARY KEY (`fk_user_id`, `fk_group_id`) ,
  INDEX `map_users_groups_fk_user_id__users_pk_id` (`fk_user_id` ASC) ,
  INDEX `map_users_groups_fk_group_id__groups_pk_id` (`fk_group_id` ASC) ,
  CONSTRAINT `map_users_groups_fk_user_id__users_pk_id`
    FOREIGN KEY (`fk_user_id` )
    REFERENCES `vouchr`.`user` (`pk_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `map_users_groups_fk_group_id__groups_pk_id`
    FOREIGN KEY (`fk_group_id` )
    REFERENCES `vouchr`.`user_group` (`pk_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_swedish_ci;

CREATE  TABLE IF NOT EXISTS `vouchr`.`map_group_api` (
  `fk_group_id` INT(10) UNSIGNED NOT NULL ,
  `fk_api_id` INT(10) UNSIGNED NOT NULL ,
  PRIMARY KEY (`fk_group_id`, `fk_api_id`) ,
  INDEX `map_groups_apis_fk_group_id__groups_pk_id` (`fk_group_id` ASC) ,
  INDEX `map_groups_apis_fk_api_id__apis_pk_id` (`fk_api_id` ASC) ,
  CONSTRAINT `map_groups_apis_fk_group_id__groups_pk_id`
    FOREIGN KEY (`fk_group_id` )
    REFERENCES `vouchr`.`user_group` (`pk_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `map_groups_apis_fk_api_id__apis_pk_id`
    FOREIGN KEY (`fk_api_id` )
    REFERENCES `vouchr`.`api_name` (`pk_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_swedish_ci;

CREATE  TABLE IF NOT EXISTS `vouchr`.`token` (
  `token` CHAR(32) NOT NULL ,
  `fk_user_id` INT(10) UNSIGNED NOT NULL ,
  `ip` VARCHAR(15) NOT NULL ,
  `expires_at` INT(11) NOT NULL ,
  PRIMARY KEY (`token`) ,
  INDEX `token_token__user_pk_id` (`fk_user_id` ASC) ,
  CONSTRAINT `token_token__user_pk_id`
    FOREIGN KEY (`fk_user_id` )
    REFERENCES `vouchr`.`user` (`pk_id` )
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_swedish_ci;

CREATE  TABLE IF NOT EXISTS `vouchr`.`region` (
  `pk_id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT ,
  `name` VARCHAR(50) NULL DEFAULT NULL ,
  `lat` FLOAT NULL DEFAULT NULL ,
  `lng` FLOAT NULL DEFAULT NULL ,
  PRIMARY KEY (`pk_id`) )
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_swedish_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
