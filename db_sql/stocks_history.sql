-- MySQL dump 10.13  Distrib 8.0.18, for Win64 (x86_64)
--
-- Host: localhost    Database: finance
-- ------------------------------------------------------
-- Server version	8.0.18

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `stock_price_history`
--

DROP TABLE IF EXISTS `stock_price_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_price_history` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `stock_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '股票代码',
  `time_interval` varchar(10) NOT NULL COMMENT '时间周期，例如5min、10min',
  `timestamp` datetime NOT NULL COMMENT '该时间周期对应的数据时间点',
  `open_price` decimal(10,2) NOT NULL COMMENT '开盘价',
  `high_price` decimal(10,2) NOT NULL COMMENT '最高价',
  `low_price` decimal(10,2) NOT NULL COMMENT '最低价',
  `close_price` decimal(10,2) NOT NULL COMMENT '收盘价',
  `volume` bigint(20) NOT NULL COMMENT '成交量',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '记录创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '记录更新时间',
  `change_percent` decimal(8,4) DEFAULT NULL COMMENT '涨跌幅（%），相对前一周期收盘价',
  `amplitude_percent` decimal(8,4) DEFAULT NULL COMMENT '振幅（%），相对最高价与最低价',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_stock_time` (`stock_code`,`time_interval`,`timestamp`),
  CONSTRAINT `fk_stock_code` FOREIGN KEY (`stock_code`) REFERENCES `stocks` (`stock_code`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='股票历史行情表';
/*!40101 SET character_set_client = @saved_cs_client */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_calc_change_amplitude` BEFORE INSERT ON `stock_price_history` FOR EACH ROW BEGIN
    DECLARE prev_close DECIMAL(10, 2);

    -- 获取上一周期的收盘价（相同股票代码和周期，且时间在当前插入记录之前，按时间倒序只取一个）
    SELECT close_price
    INTO prev_close
    FROM stock_price_history
    WHERE stock_code = NEW.stock_code
      AND time_interval = NEW.time_interval
      AND timestamp < NEW.timestamp
    ORDER BY timestamp DESC
    LIMIT 1;

    -- 如果有上一周期数据，则计算涨跌幅
    IF prev_close IS NOT NULL AND prev_close > 0 THEN
        SET NEW.change_percent = ROUND(((NEW.close_price - prev_close) / prev_close) * 100, 4);
    ELSE
        SET NEW.change_percent = NULL;
    END IF;

    -- 振幅计算：((high - low) / previous close) × 100
    IF prev_close IS NOT NULL AND prev_close > 0 THEN
        SET NEW.amplitude_percent = ROUND(((NEW.high_price - NEW.low_price) / prev_close) * 100, 4);
    ELSE
        SET NEW.amplitude_percent = NULL;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `stocks`
--

DROP TABLE IF EXISTS `stocks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stocks` (
  `stock_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '股票代码',
  `full_name` varchar(255) DEFAULT NULL COMMENT '股票全称',
  `market_sector` varchar(100) DEFAULT NULL COMMENT '所属市场板块',
  `industry` varchar(100) DEFAULT NULL COMMENT '所属行业',
  `currency` varchar(10) DEFAULT NULL COMMENT '货币单位',
  `ipo_date` date DEFAULT NULL COMMENT '上市日期',
  `address` varchar(255) DEFAULT NULL COMMENT '公司地址',
  `phone` varchar(50) DEFAULT NULL COMMENT '联系电话',
  `website` varchar(255) DEFAULT NULL COMMENT '公司网站',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '数据更新时间',
  PRIMARY KEY (`stock_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='股票基本信息表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'finance'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-28 11:27:19
