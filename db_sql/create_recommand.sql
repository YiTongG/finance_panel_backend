/*
 Navicat Premium Data Transfer

 Source Server         : mysql
 Source Server Type    : MySQL
 Source Server Version : 80018
 Source Host           : localhost:3306
 Source Schema         : finance

 Target Server Type    : MySQL
 Target Server Version : 80018
 File Encoding         : 65001

 Date: 28/07/2025 17:22:55
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for stock_recommendation
-- ----------------------------
DROP TABLE IF EXISTS `stock_recommendation`;
CREATE TABLE `stock_recommendation`  (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `stock_code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `period` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '时间周期，例如0m、-1m、-2m',
  `strong_buy` int(11) DEFAULT 0 COMMENT '强烈推荐买入程度',
  `buy` int(11) DEFAULT 0 COMMENT '推荐买入程度',
  `hold` int(11) DEFAULT 0 COMMENT '推荐持有程度',
  `sell` int(11) DEFAULT 0 COMMENT '推荐卖出程度',
  `strong_sell` int(11) DEFAULT 0 COMMENT '强烈推荐卖出程度',
  `create_time` datetime(0) NOT NULL COMMENT '缓存时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `fk_stock_code_reco`(`stock_code`) USING BTREE,
  CONSTRAINT `fk_stock_code_reco` FOREIGN KEY (`stock_code`) REFERENCES `stocks` (`stock_code`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '股票推荐程度汇总表' ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
