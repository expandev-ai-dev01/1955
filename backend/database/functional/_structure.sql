/*
  DROP TABLES IN REVERSE DEPENDENCY ORDER
*/
/*
DROP TABLE IF EXISTS [functional].[stockMovement];
DROP TABLE IF EXISTS [functional].[product];
DROP SCHEMA IF EXISTS [functional];
*/

/**
 * @schema functional
 * Contains business logic tables for stock management
 */
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'functional')
BEGIN
  EXEC('CREATE SCHEMA [functional]');
END
GO

/**
 * @table product
 * Stores product metadata and current status
 * @multitenancy true
 * @softDelete true
 * @alias prd
 */
CREATE TABLE [functional].[product] (
  [idProduct] INTEGER IDENTITY(1, 1) NOT NULL,
  [idAccount] INTEGER NOT NULL,
  [publicId] UNIQUEIDENTIFIER NOT NULL,
  [name] NVARCHAR(100) NOT NULL,
  [sku] NVARCHAR(100) NOT NULL,
  [description] NVARCHAR(500) NOT NULL DEFAULT (''),
  [unitOfMeasure] NVARCHAR(10) NOT NULL,
  [status] NVARCHAR(20) NOT NULL DEFAULT ('ACTIVE'),
  [dateCreated] DATETIME2 NOT NULL DEFAULT (GETUTCDATE()),
  [dateModified] DATETIME2 NOT NULL DEFAULT (GETUTCDATE()),
  [deleted] BIT NOT NULL DEFAULT (0)
);

/**
 * @primaryKey pkProduct
 * @keyType Object
 */
ALTER TABLE [functional].[product]
ADD CONSTRAINT [pkProduct] PRIMARY KEY CLUSTERED ([idProduct]);

/**
 * @index uqProduct_Account_PublicId
 * @type Unique
 */
CREATE UNIQUE NONCLUSTERED INDEX [uqProduct_Account_PublicId]
ON [functional].[product]([idAccount], [publicId])
WHERE [deleted] = 0;

/**
 * @index uqProduct_Account_Sku
 * @type Unique
 */
CREATE UNIQUE NONCLUSTERED INDEX [uqProduct_Account_Sku]
ON [functional].[product]([idAccount], [sku])
WHERE [deleted] = 0;

/**
 * @check chkProduct_Status
 * @enum {ACTIVE} Product is active
 * @enum {INACTIVE} Product is inactive
 */
ALTER TABLE [functional].[product]
ADD CONSTRAINT [chkProduct_Status] CHECK ([status] IN ('ACTIVE', 'INACTIVE'));

GO

/**
 * @table stockMovement
 * Records all stock transactions (immutable ledger)
 * @multitenancy true
 * @softDelete false
 * @alias sm
 */
CREATE TABLE [functional].[stockMovement] (
  [idStockMovement] INTEGER IDENTITY(1, 1) NOT NULL,
  [idAccount] INTEGER NOT NULL,
  [publicId] UNIQUEIDENTIFIER NOT NULL,
  [idProduct] INTEGER NOT NULL,
  [idUser] UNIQUEIDENTIFIER NOT NULL,
  [type] NVARCHAR(20) NOT NULL,
  [quantityChange] NUMERIC(18, 6) NOT NULL,
  [reason] NVARCHAR(200) NULL,
  [documentReference] NVARCHAR(50) NULL,
  [dateCreated] DATETIME2 NOT NULL DEFAULT (GETUTCDATE()),
  [deleted] BIT NOT NULL DEFAULT (0)
);

/**
 * @primaryKey pkStockMovement
 * @keyType Object
 */
ALTER TABLE [functional].[stockMovement]
ADD CONSTRAINT [pkStockMovement] PRIMARY KEY CLUSTERED ([idStockMovement]);

/**
 * @foreignKey fkStockMovement_Product
 * @target functional.product
 */
ALTER TABLE [functional].[stockMovement]
ADD CONSTRAINT [fkStockMovement_Product] FOREIGN KEY ([idProduct])
REFERENCES [functional].[product]([idProduct]);

/**
 * @index ixStockMovement_Account_Product
 * @type Performance
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_Account_Product]
ON [functional].[stockMovement]([idAccount], [idProduct])
INCLUDE ([quantityChange], [type]);

/**
 * @check chkStockMovement_Type
 * @enum {CREATION} Initial stock
 * @enum {INBOUND} Stock entry
 * @enum {OUTBOUND} Stock exit
 * @enum {ADJUSTMENT} Inventory adjustment
 * @enum {DELETION} Product deletion
 */
ALTER TABLE [functional].[stockMovement]
ADD CONSTRAINT [chkStockMovement_Type] CHECK ([type] IN ('CREATION', 'INBOUND', 'OUTBOUND', 'ADJUSTMENT', 'DELETION'));

GO