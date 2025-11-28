CREATE OR ALTER PROCEDURE [functional].[spStockMovementRegister]
  @idAccount INT,
  @idUser UNIQUEIDENTIFIER,
  @type NVARCHAR(20),
  @productPublicId UNIQUEIDENTIFIER,
  @quantityChange NUMERIC(18, 6),
  @productName NVARCHAR(100) = NULL,
  @productSku NVARCHAR(100) = NULL,
  @productDescription NVARCHAR(500) = NULL,
  @unitOfMeasure NVARCHAR(10) = NULL,
  @reason NVARCHAR(200) = NULL,
  @documentReference NVARCHAR(50) = NULL
AS
BEGIN
  /**
   * @summary
   * Registers a stock movement and handles product lifecycle (creation/deletion).
   * 
   * @procedure spStockMovementRegister
   * @schema functional
   * @type stored-procedure
   * 
   * @parameters
   * @param {INT} idAccount - Account identifier
   * @param {UNIQUEIDENTIFIER} idUser - User identifier
   * @param {NVARCHAR} type - Movement type (CREATION, INBOUND, OUTBOUND, ADJUSTMENT, DELETION)
   * @param {UNIQUEIDENTIFIER} productPublicId - Product UUID
   * @param {NUMERIC} quantityChange - Quantity change
   */
  
  SET NOCOUNT ON;

  DECLARE @idProduct INT;
  DECLARE @currentBalance NUMERIC(18, 6);
  DECLARE @newMovementId UNIQUEIDENTIFIER = NEWID();

  BEGIN TRY
    BEGIN TRAN;

    -- Handle CREATION type
    IF @type = 'CREATION'
    BEGIN
      -- Validate SKU uniqueness
      IF EXISTS (SELECT 1 FROM [functional].[product] WHERE [idAccount] = @idAccount AND [sku] = @productSku AND [deleted] = 0)
      BEGIN
        ;THROW 51000, 'SkuAlreadyExists', 1;
      END

      -- Create Product
      INSERT INTO [functional].[product] 
      ([idAccount], [publicId], [name], [sku], [description], [unitOfMeasure], [status])
      VALUES 
      (@idAccount, @productPublicId, @productName, @productSku, ISNULL(@productDescription, ''), @unitOfMeasure, 'ACTIVE');

      SET @idProduct = SCOPE_IDENTITY();
    END
    ELSE
    BEGIN
      -- Get Product ID for other types
      SELECT @idProduct = [idProduct]
      FROM [functional].[product]
      WHERE [idAccount] = @idAccount AND [publicId] = @productPublicId AND [deleted] = 0;

      IF @idProduct IS NULL
      BEGIN
        ;THROW 51000, 'ProductNotFound', 1;
      END

      -- Validate Active Status
      IF EXISTS (SELECT 1 FROM [functional].[product] WHERE [idProduct] = @idProduct AND [status] = 'INACTIVE')
      BEGIN
        ;THROW 51000, 'ProductInactive', 1;
      END
    END

    -- Calculate Balance for Validation
    IF @type IN ('OUTBOUND', 'ADJUSTMENT')
    BEGIN
      SET @currentBalance = [functional].[fnStockMovementGetBalance](@idAccount, @idProduct);
      
      -- Validate Outbound
      IF @type = 'OUTBOUND' AND (@currentBalance - @quantityChange) < 0
      BEGIN
        ;THROW 51000, 'InsufficientStock', 1;
      END

      -- Validate Negative Adjustment
      IF @type = 'ADJUSTMENT' AND @quantityChange < 0 AND (@currentBalance + @quantityChange) < 0
      BEGIN
        ;THROW 51000, 'InsufficientStock', 1;
      END
    END

    -- Handle DELETION type
    IF @type = 'DELETION'
    BEGIN
      UPDATE [functional].[product]
      SET [status] = 'INACTIVE', [dateModified] = GETUTCDATE()
      WHERE [idProduct] = @idProduct;
      
      SET @quantityChange = 0;
    END

    -- Register Movement
    INSERT INTO [functional].[stockMovement]
    ([idAccount], [publicId], [idProduct], [idUser], [type], [quantityChange], [reason], [documentReference])
    VALUES
    (@idAccount, @newMovementId, @idProduct, @idUser, @type, @quantityChange, @reason, @documentReference);

    COMMIT TRAN;

    -- Return the created movement ID
    SELECT @newMovementId AS [movementId];

  END TRY
  BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    THROW;
  END CATCH
END;
GO