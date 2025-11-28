CREATE OR ALTER FUNCTION [functional].[fnStockMovementGetBalance]
(@idAccount INT, @idProduct INT)
RETURNS NUMERIC(18, 6)
AS
BEGIN
  /**
   * @summary
   * Calculates the current stock balance for a product based on its movement history.
   * 
   * @function fnStockMovementGetBalance
   * @schema functional
   * @type scalar-function
   * @returns {NUMERIC(18,6)} Current stock balance
   * 
   * @parameters
   * @param {INT} idAccount - Account identifier
   * @param {INT} idProduct - Product identifier
   */
  DECLARE @balance NUMERIC(18, 6);

  SELECT @balance = ISNULL(SUM([quantityChange]), 0)
  FROM [functional].[stockMovement]
  WHERE [idAccount] = @idAccount
    AND [idProduct] = @idProduct
    AND [deleted] = 0;

  RETURN @balance;
END;
GO