
USE MASTER
GO
--DROP DATABASE DBMigrations


:setvar  DbName DBMigrations
:setvar User DBSkyUser30
--

print('$(DbName)')
DECLARE @DBPrimaryFile varchar(max), @DBLogFile varchar(max)

SET @DBLogFile='$(DbName)'+'.Log'
print(@DBLogFile)



DECLARE @data_path nvarchar(256);
SET @data_path = (SELECT SUBSTRING(physical_name, 1, CHARINDEX(N'master.mdf', LOWER(physical_name)) - 1)
                  FROM master.sys.master_files
                  WHERE database_id = 1 AND file_id = 1)




EXEC('CREATE DATABASE '+'$(DbName)'+'
 ON
PRIMARY  
    (NAME = ['+'$(DbName)'+'],
    FILENAME = '''+ @data_path+ '$(DbName)'+'.mdf'',
    SIZE = 6MB,
    MAXSIZE = 30MB,
    FILEGROWTH = 12%)
LOG ON 
   (NAME ='+'$(DBName)'+'Log' + ',
    FILENAME = '''+ @data_path+'$(DbName)'+'.ldf'',
    SIZE = 3MB,
    MAXSIZE = 22MB,
    FILEGROWTH = 17%)')


	GO

	Use $(DbName)

	GO


EXECUTE('Use '+'$(DbName)'+ '
 CREATE TABLE [dbo].[User](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[Name] [nvarchar](20) NOT NULL,
	[Username] [varchar](20) NOT NULL,
	[DOB] [date] NULL,
	[Email] [varchar](50) NOT NULL,
	[PasswordHash] [varchar](20) NOT NULL,
	[PasswordSalt] [varchar](50),
	[PhotoUrl] [nvarchar](500) NULL,
	Primary Key(ID)
)')


EXECUTE('Use '+'$(DbName)'+'
 CREATE TABLE [dbo].[Buyer](
	[ID] [int] NOT NULL,
	PRIMARY KEY(ID),
	FOREIGN KEY(ID) references [User](ID)
	On UPDATE cascade
	On DELETE cascade
)'

)

EXEC('Use '+'$(DbName)'+'
 CREATE TABLE [dbo].[Seller](
	[ID] [int] NOT NULL,
	PRIMARY KEY(ID),
	FOREIGN KEY(ID) references [User](ID)
	On UPDATE cascade
	On DELETE cascade)'
)

EXEC('Use '+'$(DbName)'+' CREATE TABLE [dbo].[Address](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[UserID] [int] NOT NULL,
	[Street] [nvarchar](20) NOT NULL,
	[City] [nvarchar](20) NOT NULL,
	[State] [nvarchar](10) NOT NULL,
	[Zip] [nvarchar](5) NOT NULL,
	[CampusMailbox] [nvarchar](4),
	[status] [nvarchar](20) 
	PRIMARY KEY(ID)
	FOREIGN KEY(UserID) references [User](ID)
	On UPDATE cascade
	On DELETE cascade)'
)

EXEC('Use ' +'$(DbName)'+
' CREATE TABLE [dbo].[Items](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[SellerID] [int] NOT NULL,
	[Name] [nvarchar](20) NOT NULL,
	[Keyword] [nvarchar](20),
	[Type] [nvarchar](20) NOT NULL,
	[Description] [nvarchar](200),
	[Price] [money] NOT NULL,
	[Status] [varchar](20) NOT NULL,
	[photoURL] [varchar](500),
	[condition] [varchar](100),
	primary key(ID),
	FOREIGN KEY(SellerID) references Seller(ID)
	On UPDATE cascade
	On DELETE cascade)'
)

EXEC('Use ' +'$(DbName)'+
' CREATE TABLE [dbo].[CreditCard](
	[CardNum] [nvarchar](32) NOT NULL,
	[Bank] [nvarchar](20),
	[ExpDate] [date] ,
	PRIMARY KEY(CardNum)
	)' 
)

EXEC('Use ' +'$(DBName)'+' CREATE TABLE [dbo].[PaymentMethod](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[UserID] [int] NOT NULL, 
	[Type] [nvarchar](30) ,
	[status] [nvarchar](20),
	PRIMARY KEY(ID),
	FOREIGN KEY (UserID) references [User](ID)
	On UPDATE cascade
	On DELETE cascade
)'
)


EXEC('Use ' +'$(DBName)'+' CREATE TABLE [dbo].[Transaction](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[Location] [nvarchar](20),
	[Price] [money], 
	[Datetime] [date],
	[AddressID] [int],
	PRIMARY KEY(ID),
	FOREIGN KEY(AddressID) references [Address](ID)
	ON UPDATE CASCADE
	ON DELETE SET NULL
)')

EXEC('Use ' +'$(DBName)'+' CREATE TABLE [dbo].[Has](
	[PaymentID] [int] NOT NULL,
	[CardNum] [nvarchar](32) NOT NULL,
	PRIMARY KEY(PaymentID, CardNum),
	FOREIGN KEY(PaymentID) references PaymentMethod(ID)
	ON UPDATE CASCADE
	ON DELETE CASCADE,
	FOREIGN KEY(CardNum) references CreditCard(CardNum)
	ON UPDATE CASCADE
	ON DELETE CASCADE
)')

EXEC('Use '+'$(DBName)'+' CREATE TABLE [dbo].[Shipping](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[ShipDate] [date] ,
	[TrackingNumber] [nvarchar](20),
	[ShippingMethod] [nvarchar](20),
	PRIMARY KEY(ID)
)')

EXEC('Use '+'$(DBName)'+ '
 CREATE TABLE [dbo].[Buy](
	[TransactionID] [int] NOT NULL,
	[ItemID] [int] NOT NULL,
	[BuyerID] [int] NOT NULL,
	[ShippingID] [int],
	[PaymentMethodID] [int] NOT NULL,
	PRIMARY KEY(TransactionID, ItemID, BuyerID),
	FOREIGN KEY (TransactionID) references [Transaction](ID),
	FOREIGN KEY(ItemID) references Items(ID),
	FOREIGN KEY(BuyerID) references Buyer(ID)
	ON UPDATE CASCADE
	ON DELETE CASCADE,
	FOREIGN KEY(ShippingID) references Shipping(ID),
	FOREIGN KEY(PaymentMethodID) references PaymentMethod(ID)
)')

EXEC('Use '+'$(DBName)'+' CREATE TABLE [dbo].[SAVE](
	[BuyerID] [int] NOT NULL,
	[ItemID] [int] NOT NULL,
	PRIMARY KEY(BuyerID, ItemID),
	FOREIGN KEY(BuyerID) references Buyer(ID),
	FOREIGN KEY(ItemID) references Items(ID)
	ON UPDATE CASCADE
	ON DELETE CASCADE
)'
)

GO 

Use $(DbName)
GO
---store procedures 
CREATE PROCEDURE [dbo].[AddAdress]
(
	@UserID int,
	@Street nvarchar(40),
	@City nvarchar(40),
	@State nvarchar(20),
	@Zip nvarchar(10),
	@CampusMailBox nvarchar(8),
	@Status nvarchar(10)='active',
	@AddressID int output
)
AS
BEGIN
	IF(@UserID IS NULL)
	BEGIN
		Raiserror('UserID cannot be null',14,1 )
		return 1 
	END


	IF(NOT EXISTS (SELECT * FROM [User] WHERE ID=@UserID))
	BEGIN
		Raiserror('User does not exist',15,2 )
		return 2
	END

	IF(@Street IS NULL)
	BEGIN
		Raiserror('Street cannot be null',14,3)
		return 3
	END

	IF(@City IS NULL)
	BEGIN
		Raiserror('City cannot be null',14,4)
		return 4
	END


	IF(@State IS NULL)
	BEGIN
		Raiserror('State cannot be null',14,5)
		return 5
	END

	IF(@Zip IS NULL)
	BEGIN
		Raiserror('Zipcode cannot be null',14,6)
		return 6
	END


	IF(EXISTS(SELECT * FROM [ADDRESS] WHERE UserID=@UserID AND Street=@Street AND City=@City AND [State]=@State AND Zip=@Zip AND CampusMailbox=@CampusMailBox))
	BEGIN
		UPDATE [ADDRESS]
		Set [status]='active'
	    WHERE UserID=@UserID AND Street=@Street AND City=@City AND [State]=@State AND Zip=@Zip AND CampusMailBox=@CampusMailBox
		
	END
	ELSE 
	BEGIN
		INSERT INTO [Address]
		(UserID, Street, City, [State], Zip, CampusMailbox, [Status])
		VALUES (@UserID, @Street, @City, @State, @Zip, @CampusMailBox, @Status)
		
	END

	DECLARE @newAddressID int;
	SET @newAddressID = @@IDENTITY;
	SET @AddressID = @newAddressID;
	return 0


END
GO


Use $(DbName)
GO

CREATE Procedure [dbo].[AddCreditCard](
	@CardNum nvarchar(32),
	@Bank_1	 nvarchar(32),
	@ExpirationDate date,
	@PaymentMethodID int
	)
AS 
BEGIN

	IF(@PaymentMethodID IS NULL OR NOT EXISTS(SELECT * FROM PaymentMethod Where ID=@PaymentMethodID))
	BEGIN
		Raiserror('PaymentMethodID is null or invald paymentMethodID', 14, 1)
	END

	IF(@CardNum IS NULL)
	BEGIN
		Raiserror('Card Number cannot be null', 14, 2)
		return 1
	END
	
	
	IF(@ExpirationDate IS NULL)
	BEGIN
		Raiserror('Expiration Date cannot be null',14,4)
		return 3
	END

	IF(@ExpirationDate<=(SELECT CONVERT(date, getdate())))
	BEGIN
		Raiserror('Credit Card is expired', 14, 5)
		return 4
	END
	---add the credit card
	INSERT INTO [CreditCard]
	(CardNum, Bank, ExpDate)
	VALUES (@CardNum, @Bank_1, @ExpirationDate)
	
	IF (@@error <> 0)
	BEGIN
		ROLLBACK TRANSACTION 
		return 6
	END

	---associates the credit card with a payment method 
	INSERT INTO Has
	(PaymentID, CardNum)
	VALUES(@PaymentMethodID, @CardNum)

	IF (@@error <> 0)
	BEGIN
		ROLLBACK TRANSACTION 
		return 7
	END

	Return 0
END

GO

Create Procedure [dbo].[addItemToSell](
	@SellerID Int,
	@Name Nvarchar(40),
	@Keyword Nvarchar(40)='generic',
	@Type Nvarchar(40)='default',
	@Description Nvarchar(400)='This is an item',
	@Price Money,
	@Photourl Nvarchar(200) = null,
	@ItemID int output
	
)
AS
BEGIN TRANSACTION

BEGIN 
	If( @SellerID is NULL OR Not Exists(SELECT * FROM [USER] Where ID=@SellerID ))
	Begin
		RAISERROR('Seller ID is null or does not exist ', 14, 1);
		ROLLBACK TRANSACTION 
		return 1
	End

	If( Not Exists(SELECT * FROM Seller Where ID=@SellerID) and Exists(SELECT * FROM [USER] Where ID=@SellerID ))
	Begin
		INSERT INTO [SELLER](ID) VALUES (@SellerID)
	End

	if(@Price is NULL OR @Price<0)
	BEGIN	
		
		RAISERROR('Price is null or is negative', 14, 2);
		ROLLBACK TRANSACTION
		return 2
	END

	if(@Name is NULL)
	BEGIN	
		ROLLBACK TRANSACTION
		RAISERROR('Name cannot be null', 14, 3);
		return 3
	END

	INSERT INTO [Items]
	( SellerID, [Name], Keyword ,[Type],[Description], Price, photoURL, [Status])
	VALUES ( @SellerID,@Name, @Keyword, @Type, @Description, @Price, @Photourl, 'unsold')

	DECLARE @newItemID int;
	SET @newItemID = @@IDENTITY;
	SET @ItemID = @newItemID;
	COMMIT TRANSACTION
	Return 0
END

GO

CREATE Procedure [dbo].[AddPaymentMethod] (
	@UserID int,
	@Type nvarchar(60),
	@CardNumber nvarchar(32)=null,
	@Bank nvarchar(40)=null,
	@ExpDate date=null
)
AS
BEGIN
	If(@UserID IS NUll OR Not Exists(SELECT * FROM [User] WHERE ID=@UserID))
	BEGIN
		Raiserror('User is null or does not exist',14, 1)
		return 1 
	END

	If(@Type IS NULL)
	BEGIN
		Raiserror('Payment type cannot be null', 14, 2)
		return 2
	END



	IF(@Type!='Card') 
	BEGIN
			IF(EXISTS(SELECT * FROM PaymentMethod WHERE UserID=@UserID AND [Type]=@Type AND [status]='active'))
			BEGIN
				Raiserror('Payment method already exists',14,3)
				return 2
			END
			ELSE IF(EXISTS(SELECT * FROM PaymentMethod WHERE UserID=@UserID AND [Type]=@Type AND [status]='deleted'))
			BEGIN
				Update PaymentMethod
				Set [status]='active'
				WHERE @UserID=UserID AND [Type]=@Type AND [status]='active'
				return 0
			END
	END


	BEGIN TRANSACTION 
		INSERT INTO [PaymentMethod]
		(UserID, [Type], [status])
		VALUES (@UserID, @Type, 'active')
		DECLARE @NewPaymentMethodID int
		SET @NewPaymentMethodID=@@Identity
		

		IF(@Type='Card')
		BEGIN
			IF(@CardNumber IS NULL OR @Bank IS NULL OR @ExpDate IS NULL)
			BEGIN
				ROLLBACK TRANSACTION 
				Raiserror('Using payment method credit card but invalid information is provided',14,3)
				return 3
			END

			---check if card already exists
			IF(EXISTS(SELECT * FROM  [User] u JOIN PaymentMethod p On u.ID=p.UserID JOIN Has h on p.ID=h.PaymentID WHERE p.Type='Card' AND u.ID=@UserID AND h.CardNum=@CardNumber))
			BEGIN
				print(@UserID)
				RAISERROR('Credit card already exists for this user, ID: ', 14,4)
				ROLLBACK TRANSACTION
				return 4
			END
			---create a new creditCard
			DECLARE @addCCErr int
			 EXEC @addCCErr=AddCreditCard @CardNum=@CardNumber, @Bank_1=@Bank, @ExpirationDate=@ExpDate, @PaymentMethodID=@NewPaymentMethodID
			IF (@addCCErr <> 0)
			BEGIN
				RAISERROR('Error: Credit Card cannot be added ',14,5)
				ROLLBACK TRANSACTION
				return 5
			END
		END
	COMMIT TRANSACTION
	Return 0
	
END


GO



CREATE Procedure [dbo].[createTransaction]
(@TransactionID Int output,
@Location nvarchar(40),
@Price money,
@Datetime Date,
@AddressID int)
AS 
BEGIN

	If(@Price IS NULL OR @Price<0)
	BEGIN
		RAISERROR('Price is null or negative', 14,1);
		return 1
	END

	IF(@Location is NULL)
	BEGIN
		RAISERROR('Location is null', 14,2);
		return 2
	END

	If(@Datetime!=(SELECT CAST( GETDATE() AS Date )))
	BEGIN
		RAISERROR('Location is null', 14,2);
		return 2
	END

	
	INSERT INTO [Transaction]
	( [Location], Price,[Datetime], AddressID)
	VALUES ( @Location,@Price, @DateTime, @AddressID)

	DECLARE @newTransactionID int;
	SET @newTransactionID = @@IDENTITY;
	SET @TransactionID = @newTransactionID;
	Return 0

END
GO

CREATE procedure [dbo].[CreateShipment] 
	@TrackingNumber nvarchar(20) = null, @ShippingMethod nvarchar(20)=null,
	@TransactionID int, @ShippingID int OUTPUT
AS

IF @TransactionID is null
begin
	RAISERROR ('Error: Transaction ID cannot be null.',14,1)
	return 1
end

IF @TransactionID NOT IN (SELECT ID from [Transaction])
begin
	RAISERROR ('Error: There is no such transaction.',14,1)
	return 2
end

IF (SELECT ShippingID from BUY where TransactionID = @TransactionID) is NOT NULL
begin
	RAISERROR ('Error: There is a shipping already.',14,1)
	return 2
end

Begin Transaction

Insert into [Shipping](ShipDate,ShippingMethod, TrackingNumber)
values(NULL,@ShippingMethod,@TrackingNumber)

Declare @newID int
Set @newID = @@IDENTITY
Set @ShippingID = @newID

Update Buy
Set ShippingID = @newID
WHERE TransactionID = @TransactionID



-- Check for errors
DECLARE @Status SMALLINT
SET @Status = @@ERROR
IF @Status <> 0 
BEGIN
	-- Return error code to the calling program to indicate failure.
	PRINT 'An error occurred when creating shippment'
	ROLLBACK TRANSACTION
	RETURN(@Status)
END
ELSE
BEGIN
	-- Return 0 to the calling program to indicate success.
	PRINT 'Shippment created successfully.'
	COMMIT TRANSACTION
	RETURN(0)
END



GO




---buy item 
CREATE Procedure [dbo].[BuyItem]
	(

	@ItemID Int,
	@BuyerID  Int,
	@ShippingID Int=NULL,
	@PaymentMethodID Int,
	@Location_1 nvarchar(40) = NULL,
	@Price_1 money,
	@AddressID_1 int = NULL,
	@BuyID Int output
	)

AS
BEGIN
BEGIN TRANSACTION
	
	If( @ItemID is NULL OR Not Exists(SELECT * FROM Items Where ID=@ItemID ))
	Begin
		RAISERROR('ItemID is null or item does not exist ', 14, 1);
		ROLLBACK TRANSACTION
		return 1
	End

	if( (select [status] from Items WHERE ID = @ItemID) <> 'unsold')
	BEGIN
		RAISERROR('Item is not available ', 14, 1);
		ROLLBACK TRANSACTION
		return 2
	END

	if(@BuyerID is NULL OR NOT Exists(SELECT * FROM [USER] Where ID=@BuyerID))
	BEGIN
		RAISERROR('BuyerID is null or User does not exist', 14, 2);
		ROLLBACK TRANSACTION
		return 3
	END

	IF (NOT Exists(SELECT * FROM Buyer Where ID=@BuyerID))
	BEGIN
		INSERT INTO [Buyer] (ID) VALUES (@BuyerID)
	END

	IF (@@error <> 0)
	BEGIN
		ROLLBACK TRANSACTION 
		return 7
	END

	
	if(@PaymentMethodID is NULL OR NOT Exists(SELECT * FROM PaymentMethod Where ID=@PaymentMethodID))
	BEGIN	
		RAISERROR('PaymentMethodID is null or does not exist', 14, 2);
		ROLLBACK TRANSACTION
		return 4
	END

	
	if( NOT Exists(SELECT * FROM PaymentMethod Where ID=@PaymentMethodID AND UserID=@BuyerID) )
	BEGIN	
		RAISERROR('Payment method is not associated with the user', 14, 3);
		ROLLBACK TRANSACTION
		return 5
	END


	If(@Price_1 IS NULL OR @Price_1<0)
	BEGIN
		RAISERROR('Price is null or negative', 14,4);
		ROLLBACK TRANSACTION
		return 6
	END


	DECLARE @DateTime_1 Date
	SET @DateTime_1 = (SELECT CAST( GETDATE() AS Date ))

	DECLARE @NewTransactionID int
	DECLARE @ErrorCode int


	IF(@Location_1 is NULL)
	BEGIN
		set @Location_1 = 'Shipping';
	END

	---create transaction
	 EXEC @ErrorCode= createTransaction @TransactionID=@NewTransactionID output, @Location=@Location_1, @Price=@Price_1, @DateTime=@DateTime_1, @AddressID=@AddressID_1
	 IF(@ErrorCode<>0)
	 BEGIN
		ROLLBACK TRANSACTION 
		return 7	
	 END


	
	IF(@Location_1 = 'Shipping')
	BEGIN
		---create shipping (if it is needed)
		EXEC @ErrorCode= [dbo].[CreateShipment] 
			@TransactionID = @NewTransactionID, @ShippingID = @ShippingID Output
		IF(@ErrorCode<>0)
		 BEGIN
			ROLLBACK TRANSACTION 
			return 7	
		 END
	END


	---createBuy
	INSERT INTO [Buy]
	( TransactionID, ItemID, BuyerID, ShippingID, PaymentMethodID)
	VALUES ( @NewTransactionID,@ItemID, @BuyerID, @ShippingID, @PaymentMethodID)

	--Change Item status
	Update Items
	set Status = 'sold'
	where ID = @ItemID
	
	IF (@@error <> 0)
	BEGIN
		ROLLBACK TRANSACTION 
		return 7
	END
	
	DECLARE @newBuyID int;
	SET @newBuyID = @@IDENTITY;
	SET @NewBuyID = @BuyID;
	COMMIT TRANSACTION
	Return 0

END

GO


CREATE Procedure [dbo].[Updateshipment]
--This changes shipping information. It does not need Shipping ID. Instead, it needs a transactionID
--and update its shipping.
	@TrackingNumber nvarchar(20), @ShippingMethod nvarchar(20)=null,
	@TransactionID int
AS


IF @TransactionID is null
begin
	RAISERROR ('Error: Transaction ID cannot be null.',14,1)
	return 1
end

IF @TransactionID NOT IN (SELECT TransactionID from BUY)
begin
	RAISERROR ('Error: There is no such transaction.',14,1)
	return 2
end

IF (SELECT ShippingID from BUY where TransactionID = @TransactionID) is NULL
begin
	RAISERROR ('Error: There is no shipping to update. Please create one first',14,1)
	return 2
end

UPDATE Shipping
SET ShippingMethod = @ShippingMethod,
  TrackingNumber = @TrackingNumber,
  ShipDate = GETDATE()
WHERE ID = (Select ShippingID FROM Buy 
			Where TransactionID = @TransactionID)


-- Check for errors
DECLARE @Status SMALLINT
SET @Status = @@ERROR
IF @Status <> 0 
BEGIN
	-- Return error code to the calling program to indicate failure.
	PRINT 'An error occurred when creating shippment'
	RETURN(@Status)
END
ELSE
BEGIN
	-- Return 0 to the calling program to indicate success.
	PRINT 'Shippment created successfully.'
	RETURN(0)
END


GO


CREATE Procedure [dbo].[Delete_Shipmment]
--This changes shipping information. It does not need Shipping ID. Instead, it needs a transactionID
--and update its shipping.
	@TransactionID int
AS


IF @TransactionID is null
begin
	RAISERROR ('Error: Transaction ID cannot be null.',14,1)
	return 1
end

IF @TransactionID NOT IN (SELECT TransactionID from BUY)
begin
	RAISERROR ('Error: There is no such transaction.',14,1)
	return 2
end

IF (SELECT ShippingID from BUY where TransactionID = @TransactionID) is NULL
begin
	RAISERROR ('Error: There is no shipping to delete.',14,1)
	return 2
end

DECLARE @shippingID int
 Select @shippingID = ShippingID FROM Buy 
			Where TransactionID = @TransactionID
UPDATE Buy
SET ShippingID = NULL
WHERE TransactionID = @TransactionID

DELETE Shipping
WHERE ID = @shippingID

-- Check for errors
DECLARE @Status SMALLINT
SET @Status = @@ERROR
IF @Status <> 0 
BEGIN
	-- Return error code to the calling program to indicate failure.
	PRINT 'An error occurred when creating shippment'
	RETURN(@Status)
END
ELSE
BEGIN
	-- Return 0 to the calling program to indicate success.
	PRINT 'Shippment Deleted successfully.'
	RETURN(0)
END
GO


CREATE procedure [dbo].[deleteAddress](@UID int, @AddrID int)
As
IF(@AddrID is NULL OR Not Exists(SELECT ID FROM [Address] where @AddrID = ID))
	BEGIN
		RAISERROR('Addr cannot be null or does not exist in PaymentMethod', 14, 1);
		return 1
	END

IF(@UID is NULL OR Not Exists(SELECT UserID FROM [Address] where @UID = UserID))
	BEGIN
		RAISERROR('UID cannot be null or does not exist in Address', 14, 1);
		return 2
	END

If(Not Exists(
	SELECT * FROM [Address]
	WHERE ID= @AddrID AND UserID=@UID
	))Begin
		RAISERROR('There is no user who own this Address.', 14, 3);
		return 3
	End

Update [Address]
Set [status] = 'deleted'
WHERE (ID = @AddrID)
return 0
GO





CREATE Procedure [dbo].[DeleteItem](
	@ItemID Int, 
	@SellerID Int
)
AS
BEGIN
	IF(@ItemID is NULL OR Not Exists(SELECT * FROM Items Where ID=@ItemID ))
	BEGIN
		RAISERROR('ItemID cannot be null or does not exist', 14, 1);
		return 1
	END

	If( @SellerID is NULL OR Not Exists(SELECT * FROM Seller Where ID=@SellerID ))
	Begin
		RAISERROR('Seller ID is null or does not exist ', 14, 2);
		return 2
	End

	If((select [Status] from Items where @ItemID=ID) ='sold')
	Begin
		RAISERROR('Item has been sold ', 14, 2);
		return 2
	end

	If(Not Exists(
	SELECT * FROM Items 
	WHERE ID=@ItemID AND SellerID=@SellerID
	))Begin
		RAISERROR('There is no seller selling this product or no product is sold by this seller.', 14, 3);
		return 3
	End


	DELETE Items
	WHERE ( ID = @ItemID AND SellerID= @SellerID and [Status] ='unsold' )
	return 0

END

GO
CREATE procedure [dbo].[deletePaymentMethod](@UID int, @paymentID int)
As
BEGIN
IF(@paymentID is NULL OR Not Exists(SELECT ID FROM PaymentMethod where @paymentID = ID))
	BEGIN
		RAISERROR('paymentMethodID cannot be null or does not exist in PaymentMethod', 14, 1);
		return 1
	END

IF(@UID is NULL OR Not Exists(SELECT UserID FROM PaymentMethod where @UID = UserID))
	BEGIN
		RAISERROR('UID cannot be null or does not exist in PaymentMethod', 14, 1);
		return 2
	END

If(Not Exists(
	SELECT * FROM PaymentMethod
	WHERE ID= @paymentID AND UserID=@UID
	))Begin
		RAISERROR('There is no user who own this paymentID.', 14, 3);
		return 3
	End
IF(NOT EXISTS(SELECT * FROM Buy Where PaymentMethodID= @paymentID))
BEGIN
	DELETE FROM PaymentMethod
	WHERE ID=@paymentID

	DECLARE @PaymentType NVarchar(60)
	
	SELECT @PaymentType=[Type] FROM PaymentMethod WHERE @paymentID=ID

	IF(@PaymentType='Card')
	BEGIN

		DECLARE @CardNum NVarchar(32)
		SELECT @CardNum=CardNum FROM Has Where PaymentID=@paymentID
		DELETE FROM CreditCard WHERE @CardNum=CardNum

	END
END


ELSE IF(EXISTS(SELECT * FROM Buy Where PaymentMethodID= @paymentID))
BEGIN
	Update PaymentMethod
	Set [status] = 'deleted'
	WHERE (ID = @paymentID)
	return 0
END

END

GO
CREATE procedure [dbo].[Login]
	@Username nvarchar(20),
	@Password nvarchar(20)
As
IF @Username is null
begin
	RAISERROR ('Error: Name cannot be null.',14,1)
	return 1
end

IF(NOT EXISTS(SELECT * FROM [User] Where username=@Username))
BEGIN
	RAISERROR ('Error: User does not exist',14,2)
	return 2
END
If @Password is null
begin
	RAISERROR ('Error: Password cannot be null.',14,3)
	return 3
end 

GO


CREATE Procedure [dbo].[ModifyItem](
	@ItemID Int, 
	@SellerID Int,
	@Name Nvarchar(40)=null,
	@Keyword Nvarchar(40)=null,
	@Type Nvarchar(40)=null,
	@Description Nvarchar(400)=null,
	@Price Money=null
)
AS
BEGIN	 

	IF(@ItemID is NULL OR Not Exists(SELECT * FROM Items Where ID=@ItemID ))
	BEGIN
		RAISERROR('ItemID cannot be null or does not exist', 14, 1);
		return 1
	END

	If( @SellerID is NULL OR Not Exists(SELECT * FROM Seller Where ID=@SellerID ))
	Begin
		RAISERROR('Seller ID is null or does not exist ', 14, 2);
		return 2
	End

	If(Not Exists(
	SELECT * FROM Items
	WHERE ID=@ItemID AND SellerID=@SellerID
	))Begin
		RAISERROR('There is no seller selling this product or no product is sold by this seller.', 14, 3);
		return 3
	End


	Declare @oldName AS Nvarchar(40), @oldKeyWord AS Nvarchar(40),@OldType AS Nvarchar(40), @oldPrice as Money, @OldDescription as Nvarchar(400)
	Select @oldName=[Name], @oldKeyWord=keyword, @oldPrice=Price, @OldDescription=[Description], @OldType=Type
	From Items 
	WHERE  ID=@ItemID AND SellerID=@SellerID

	

	---if any of the input value are different, update.
	If(@OldName!=@Name OR @OldKeyword!=@Keyword OR @OldType!=@Type OR @OldDescription!=@Description OR @OldPrice!=@Price)
	BEGIN 
		If(@Name is NULL)
		Begin
			Set @Name=@OldName
		END

		If(@Keyword is NULL)
		Begin
			Set @Keyword=@oldKeyWord
		END

		If(@Description is NULL)
		Begin
			Set @Description=@OldDescription
		END

		If(@Type is NULL)
		Begin
			Set @Type=@OldType
			
		END

		IF(@Price is NULL)
		BEGIN
			Set @Price=@OldPrice
		END
		
		UPDATE Items
		SET  [Name]= @Name, Keyword=@Keyword,
		[Type]=@Type, [Description]=@Description,
		Price=@Price
		WHERE (ID = @ItemID AND SellerID=@SellerID)
	END
	return 0
END

GO
CREATE PROCEDURE [dbo].[register]
	@Name nvarchar(20),
	@Username nvarchar(20),
	@DOB date,
	@Email varchar(50),
	@PasswordSalt varchar(50),
	@PasswordHash varchar(5000),
	@UserID int output

AS

IF @Name is null
begin
	RAISERROR ('Error: Name cannot be null.',14,1)
	return 1
end
IF @Username is null
begin
	RAISERROR ('Error: Username cannot be null.',14,1)
	return 2
end
IF @Email is null
begin
	RAISERROR ('Error: Email cannot be null.',14,1)
	return 3
end

IF @PasswordHash is null
begin
	RAISERROR ('Error: Password cannot be null.',14,1)
	return 4
end

IF Exists (SELECT Username from [User] where Username = @Username) 
begin
	RAISERROR ('Error: There is a username already.',14,1)
	return 6
end



Insert into [User]
([Name], Username, DOB,Email,[PasswordHash],[PasswordSalt])
values(@Name, @Username, @DOB,@Email,@PasswordHash,@PasswordSalt)

DECLARE @newUserID int;
SET @newUserID = @@IDENTITY;
SET @UserID = @newUserID;

Return 0

-- Check for errors
DECLARE @Status SMALLINT
SET @Status = @@ERROR
IF @Status <> 0 
BEGIN
	-- Return error code to the calling program to indicate failure.
	PRINT 'An error occurred when creating shippment'
	RETURN(@Status)
END
ELSE
BEGIN
	-- Return 0 to the calling program to indicate success.
	PRINT 'Register created successfully.'
	RETURN(0)
END

GO

CREATE PROCEDURE [dbo].[SaveItem] 
(@BuyerID [int],
@ItemID [int])
AS
BEGIN
	IF(@ItemID is NULL OR Not Exists(SELECT * FROM Items Where ID=@ItemID ))
	BEGIN
		RAISERROR('ItemID cannot be null or does not exist', 14, 1);
		return 1
	END

	If( @BuyerID is NULL OR Not Exists(SELECT * FROM Buyer Where ID=@BuyerID ))
	Begin

		IF(@BuyerID IS NOT NULL AND EXISTS(SELECT * FROM [User] Where ID=@BuyerID))
		BEGIN 
			INSERT INTO Buyer (ID) Values(@BuyerID)
		END
		ELSE 
		BEGIN 
			RAISERROR('Buyer ID is null or does not exist ', 14, 2);
			return 2
		END
	End	

	INSERT INTO [SAVE]
	(BuyerID, ItemID)
	VALUES ( @BuyerID, @ItemID)

	Return 0

END
GO




CREATE PROCEDURE [dbo].[dataImport] (
	@name nvarchar(20),
	@username nvarchar(20),
	@passwordSalt varchar(50),
	@passwordHash varchar(5000),
	@email varchar(50),
	@dob Date,
	@itemName Nvarchar(40),
	@keyword Nvarchar(40),
	@type Nvarchar(40),
	@description Nvarchar(400),
	@price Money,
	@photoUrl Nvarchar(200),
	@street nvarchar(40),
	@city nvarchar(40),
	@state nvarchar(20),
	@zip nvarchar(10),
	@campusMail nvarchar(8),
	@cardType nvarchar(60),
	@cardNum nvarchar(32),
	@bank nvarchar(40),
	@expDate date
	)
As

Declare @userID int 
Declare @itemID int
Begin Transaction
	DECLARE @result1 int
	exec @result1=[dbo].register
	@Name = @name,
	@Username = @username,
	@DOB = @dob,
	@Email = @email,
	@PasswordSalt = @passwordSalt,
	@PasswordHash = @passwordHash,
	@UserID = @userID output

	If(@result1>0)
	BEGIN
		ROLLBACK TRANSACTION
		return 1
	END

	

	declare @result2 int
	exec  @result2= [dbo].[addItemToSell]
	@SellerID =@userID,  --don't know,
	@Name = @itemName,
	@Keyword = @keyword,
	@Type = @type,
	@Description = @description ,
	@Price = @price,
	@Photourl = @photoUrl,
	@ItemID =  @itemID output
	
	If(@result2>0)
	Begin
		ROLLBACK TRANSACTION
		return 2
	END

	declare @addressOutput int
	declare @result3 int
	exec @result3=[dbo].[AddAdress]
	@UserID = @userID,
	@Street = @street,
	@City = @city,
	@State = @state,
	@Zip = @zip,
	@CampusMailBox = @campusMail,
	@Status ='active',
	@AddressID = @addressOutput output

	If(@result3>0)
	Begin
		ROLLBACK TRANSACTION
		return 3
	END

	declare @result4 int
	exec @result4=[dbo].[AddPaymentMethod]
	@UserID = @userID,
	@Type =@cardtype,
	@CardNumber = @cardNum,
	@Bank = @bank,
	@ExpDate = @expDate
	If(@result4>0)
	Begin
		ROLLBACK Transaction
		return 4
	END

	COMMIT TRANSACTION
	RETURN 0;


GO

CREATE Procedure [dbo].[UpdateAddress](
	@UserID int,
	@AddressID int,
	@Street nvarchar(40)=null,
	@City nvarchar(40)=null,
	@State nvarchar(20)=null,
	@Zip nvarchar(10)=null,
	@CampusMailBox nvarchar(8)=null
)
AS 
BEGIN
	IF(@UserID is NULL OR NOT EXISTS(SELECT * FROM [User] WHERE ID=@UserID))
	BEGIN
		RAISERROR('User is null or does not exist',14,1)
		return 1
	END

	IF(@AddressID is NULL OR NOT EXISTS(SELECT * FROM [Address] WHERE ID=@AddressID))
	BEGIN
		RAISERROR('Address is null or does not exist',14,2)
		return 2
	END

	IF(NOT EXISTS(SELECT * FROM [Address] WHERE ID=@AddressID AND UserID=@UserID))
	BEGIN
		Raiserror('Address is not associated with this user',15,3)
		return 3
	END

	DECLARE @OldStreet nvarchar(40), @OldCity nvarchar(40), @OldState nvarchar(20), @OldZip nvarchar(10), @OldCampusMailBox nvarchar(8)
	SELECT @OldStreet=Street, @OldCity=City, @OldState=[State], @OldZip=Zip, @OldCampusMailBox=CampusMailBox FROM [Address]
	WHERE @AddressID=ID AND @UserID=UserID
	
	IF(@Street!=@OldStreet OR @City!=@OldCity OR @Zip!=@OldZip OR @CampusMailBox!=@OldCampusMailBox OR @State!=@OldState )
	BEGIN
		
		IF(@Street is NULL)
		BEGIN
			SET @Street=@OldStreet
		END

		IF(@City IS NULL)
		BEGIN
			SET @City=@OldCity
		END

		IF(@State IS NULL)
		BEGIN
			SET @State=@OldState
		END


		IF(@Zip IS NULL)
		BEGIN
			SET @Zip=@OldZip
		END

		IF(@CampusMailBox is NULL)
		BEGIN
			SET @CampusMailBox=@OldCampusMailBox
		END
		
		UPDATE [ADDRESS]
		Set Street=@Street,
		[State]=@State,
		Zip=@Zip,
		City=@City,
		CampusMailbox=@CampusMailBox
	    WHERE UserID=@UserID AND ID=@AddressID

		return 0
	END

END
GO
CREATE PROCEDURE [dbo].[UpdatePaymentMethod]
(
	@PaymentMethodID int,
	@UserID int,
	@Type nvarchar(60)=null,
	@CardNumber nvarchar(32)=null,
	@Bank nvarchar(40)=null,
	@ExpDate date=null
	)
AS
BEGIN 
	IF(@PaymentMethodID IS NULL OR NOT EXISTS(SELECT * FROM PaymentMethod Where ID=@PaymentMethodID))
	BEGIN
		Raiserror('Payment method id is null or does not exist',14,1)
		return 1
	END

	IF(@UserID IS NULL OR NOT EXISTS(SELECT * FROM [User] Where ID=@UserID))
	BEGIN 
		Raiserror('User %i is null or does not exist',14,2, @UserID)
		return 2
	END

	IF(NOT EXISTS(SELECT * FROM PaymentMethod WHERE ID=@PaymentMethodID AND UserID=@UserID))
	BEGIN
		Raiserror('This payment method is not associated with this user', 15, 3)
		return 3
	END

	IF(EXISTS(SELECT * FROM PaymentMethod WHERE @PaymentMethodID!=ID AND UserID=@UserID AND [Type]=@Type AND [status]='active'))
	BEGIN
		RAISERROR('Payment method already exists',14,3)
		return 4
	END

	DECLARE @oldPaymentType nVarchar(60)
	
	SELECT @oldPaymentType=Type FROM PaymentMethod WHERE ID=@PaymentMethodID
	Print(@oldPaymentType)
		Print(@Type)
	IF(@oldPaymentType='Card' AND @Type IS NOT NULL AND @Type!='Card')
	BEGIN
		Raiserror('Cannot change a card type to other type',14,4)
		return 5
	END
	ELSE IF (@oldPaymentType='Card')
	BEGIN

		DECLARE  @oldCardNumber AS nVarchar(32), @oldExpDate AS Date, @oldBank AS nvarchar(20)
		SELECT @oldCardNumber=CardNum FROM Has Where PaymentID=@PaymentMethodID
		SELECT @oldExpDate=ExpDate, @oldBank=Bank FROM CreditCard Where CardNum=@oldCardNumber
		IF(@oldCardNumber!=@CardNumber OR @oldExpDate!=@ExpDate OR @Bank!=@oldBank)
		BEGIN
			IF(@ExpDate IS NOT NULL AND @ExpDate<=(SELECT CONVERT(date, getdate())))
			BEGIN
				Raiserror('The credit card is expired or expiration date is null',14,5)
				return 7
			END

			IF(@CardNumber IS NULL)
			BEGIN
				SET @CardNumber=@oldCardNumber
			END

			IF(@ExpDate IS NULL)
			BEGIN
				SET @ExpDate=@oldExpDate
			END

			IF(@Bank is NULL)
			BEGIN
				SET @Bank=@oldBank
			END
			
			Update CreditCard
			Set CardNum=@CardNumber,Bank=@Bank, ExpDate=@ExpDate
			WHERE (CardNum=@oldCardNumber)
			return 0
		END

	END

	ELSE IF(@oldPaymentType!='Card')
	BEGIN

	
	IF(@Type !=@oldPaymentType)
		BEGIN
			
			IF(@Type is NULL)
			BEGIN
				SET @Type=@oldPaymentType
			END
			ELSE IF(@Type='Card')
			BEGIN
				Raiserror('Cannot change to payment method type to card',14,5)
				return 8
			END

			ELSE 
			BEGIN

				Update PaymentMethod
				SET [Type]=@Type
				WHERE ID=@PaymentMethodID
				return 0
			END
		END

	END
	
		
END 

GO
CREATE PROCEDURE [dbo].[changeUserInfo]
	@Name nvarchar(20),
	@DOB date = NULL,
	@Email varchar(50),
	@photoURL varchar(200) = NULL,
	@UserID int 

AS

IF @Name is null
begin
	RAISERROR ('Error: Name cannot be null.',14,1)
	return 1
end

IF @Email is null
begin
	RAISERROR ('Error: Email cannot be null.',14,1)
	return 2
end

IF @UserID IS NULL
begin
	RAISERROR ('Error: USER ID cannot be null.',14,1)
	return 4
end

IF NOT Exists (SELECT ID from [User] where ID = @UserID) 
begin
	RAISERROR ('Error: There is no such username.',14,1)
	return 3
end

UPDATE [USER]
SET Email = @Email, DOB = @DOB, PhotoUrl = @photoURL, [Name] = @Name
WHERE ID = @UserID



DECLARE @newUserID int;
SET @newUserID = @@IDENTITY;
SET @UserID = @newUserID;

Return 0

-- Check for errors
DECLARE @Status SMALLINT
SET @Status = @@ERROR
IF @Status <> 0 
BEGIN
	-- Return error code to the calling program to indicate failure.
	PRINT 'An error occurred when updating userInfo'
	RETURN(@Status)
END
ELSE
BEGIN
	-- Return 0 to the calling program to indicate success.
	PRINT 'Register created successfully.'
	RETURN(0)
END

GO

--create functions
CREATE FUNCTION [dbo].[MyAddress](@UserID int)
RETURNS TABLE
AS
RETURN
(
	SELECT ID, Street, City, [State], Zip, CampusMailBox FROM [Address]
	WHERE UserID=@UserID AND status='active'

)


GO




CREATE FUNCTION [dbo].[MyPaymentMethod](@userID int)
RETURNS @PaymentMethods TABLE
	(PaymentMethodID int Primary KEY NOT NULL,
	[Type] nvarchar(60) NOT NULL,
	CardNumber nvarchar(32),
	Bank nvarchar(40),
	ExpirationDate date
	)

AS 
BEGIN 
DECLARE @Type nvarchar(60)

INSERT @PaymentMethods Select p.ID AS PaymentMethodID, p.[Type] AS [Type], null, null, null
FROM PaymentMethod p WHERE p.UserID=@userID AND p.[Type]!='Card' AND  p.status='active'

INSERT @PaymentMethods  Select p.ID AS PaymentMethodID, p.[Type] AS [Type],c.CardNum as CardNumber, c.Bank as Bank, c.ExpDate as ExpirationDate
FROM PaymentMethod p JOIN Has h on p.ID=h.PaymentID JOIN CreditCard c on h.CardNum=c.CardNum
WHERE p.UserID=@userID AND p.[Type]='Card' AND p.status='active'

RETURN
END

GO


CREATE FUNCTION [dbo].[SavedList]
(@userID int)
RETURNS TABLE
AS
RETURN
(SELECT I.[Name] as ItemName,
		I.ID as ItemID, 
		I.Price, 
		I.[Type],
		I.photoURL AS photoURL
From [SAVE] S
Join [User] U on U.ID=S.BuyerID
join [Items] I on I.ID =S.ItemID
where @userID=U.ID
) 

GO

--might need to create later 
CREATE Procedure [dbo].[DeleteFromSavelist]
(
	@UserID int,
	@ItemID Int
)
AS

IF(@ItemID is NULL OR Not Exists(SELECT * FROM SavedList(@UserID)))
	BEGIN
		RAISERROR('ItemID cannot be null or does not exist', 14, 1);
		return 1
	END

Delete 
From [SAVE]
where ItemID=@ItemID and [save].BuyerID=@UserID

GO


CREATE FUNCTION [dbo].[viewLogin]
(@User varchar(20)
)
RETURNS TABLE
AS
RETURN
(SELECT [User].ID,
		[User].PasswordHash,
		[User].PasswordSalt
 FROM [User]
 WHERE Username = @User);

 GO


CREATE FUNCTION [dbo].[viewUser]
(@User varchar(20)
)
RETURNS TABLE
AS
RETURN
(SELECT [User].ID,
		[User].[Name],
		[User].[DOB],
		[User].[Email],
		[User].PhotoUrl
 FROM [User]
 WHERE Username = @User);

 GO
 
CREATE FUNCTION [dbo].[sellerTransaction]
(@ItemID int
)
RETURNS TABLE
AS
RETURN
(SELECT Price, [Datetime] as PurchaseTime, U.[Name] as [Buyer Name], Email as [Buyer Email], TransactionID,
[Location], Street, City, [State], Zip, CampusMailbox, --address
TrackingNumber, ShippingMethod --Shipping

From Buy join [Transaction] t
on Buy.TransactionID = t.ID 
left join [Address] a on t.AddressID = a.ID
join [User] U on U.ID = BuyerID
LEFT JOIN Shipping S ON S.ID = Buy.ShippingID
where ItemID = @ItemID
) 

Go

CREATE FUNCTION [dbo].[myOrders]
(@userID int
)
RETURNS TABLE
AS
RETURN
(
SELECT b.TransactionID as TransactionID,i.photoURL as PhotoURL ,i.name as ItemName, i.price as Price, u.Name as SellerName, u.Email ,t.Datetime as PurchaseDate, p.Type as PaymentType, h.CardNum as CardNumber,
t.Location as Location,  a.street as Street, a.city as City, a.Zip as Zip,a.[State] as [State],  a.CampusMailbox as CampusMailBox, 
s.ShippingMethod, s.TrackingNumber, s.ShipDate
FROM 
Buy b JOIN [Transaction] t on b.TransactionID=t.ID JOIN Items i on b.ItemID=i.ID  LEFT JOIN [Address] a on t.AddressID=a.ID 
JOIN [User] u on i.SellerID=u.ID Left join Shipping s on b.ShippingID=s.ID JOIN PaymentMethod p on b.PaymentMethodID=p.ID 
LEFT JOIN has h on p.ID=h.PaymentID
WHERE b.BuyerID=@userID
) 
GO

 -------------Views

 
CREATE VIEW [dbo].[browseItem]
AS
SELECT I.ID, I.Name as ItemName, I.Price, I.Type as ItemType,I.Description as "Item's description", I.Keyword as "Item's keyword",U.Username as SellerUsername ,U.Name as SellerName, U.Email as SellerEmail, I.SellerID as SellerID,  I.photoURL, I.Status, I.condition
from Items I
Join [User] U on I.SellerID = U.ID 

GO



CREATE VIEW [dbo].[Order]
As
select U.Name as buyerName, I.Name as itemName, I.Price as price, S.ShipDate, S.ShippingMethod, S.TrackingNumber
from [User] U
join Buy on Buy.BuyerID = U.ID
join Items I on Buy.ItemID = I.ID
join [Shipping] S on S.ID = buy.ShippingID
GO

CREATE VIEW [dbo].[SoldStatistics]
As
select I.Name as itemName, T.Datetime, T.Location
from Buy B
join Items I on I.ID = B.ItemID 
join [Transaction] T on T.ID = B.TransactionID
GO


CREATE VIEW [dbo].[SaveList]
As
Select U.Name as BuyerName, I.Name as ItemName, I.ID as ItemID, I.Price, I.Type
From [SAVE] S
Join [User] U on U.ID=S.BuyerID
join [Items] I on I.ID =S.ItemID
GO







---permission to functions
Use $(DBName)
GO

CREATE USER $(User) FROM LOGIN $(User);
exec sp_addrolemember db_datareader, '$(User)';
GO

ALTER ROLE db_datawriter ADD MEMBER $(User)
GO


EXEC('GRANT SELECT ON MyAddress to '+'$(User)')
EXEC('GRANT SELECT ON myOrders to '+'$(User)')
EXEC('GRANT SELECT ON SavedList to '+'$(User)')
EXEC('GRANT SELECT ON sellerTransaction to '+'$(User)')
EXEC('GRANT SELECT ON viewLogin to '+'$(User)')
EXEC('GRANT SELECT ON myPaymentMethod to '+'$(User)')
EXEC('GRANT SELECT ON viewUser to '+'$(User)')

--permission to views
EXEC('GRANT SELECT ON browseItem to '+'$(User)')
EXEC('GRANT SELECT ON order to '+'$(User)')
EXEC('GRANT SELECT ON SaveList to '+'$(User)')
EXEC('GRANT SELECT ON soldStatistics to '+'$(User)')

--permission to store procedures
EXEC('GRANT EXECUTE ON addItemToSell TO ' +'$(User)')
EXEC('GRANT EXECUTE ON ModifyItem TO '+ '$(User)')
EXEC('GRANT EXECUTE ON DeleteItem TO '+ '$(User)')
EXEC('GRANT EXECUTE ON SaveItem  TO '+'$(User)')
EXEC('GRANT EXECUTE ON createTransaction TO ' +'$(User)')
EXEC('GRANT EXECUTE ON CreateShipment TO ' +'$(User)') 
EXEC('GRANT EXECUTE ON BuyItem TO ' +'$(User)')
EXEC('GRANT EXECUTE ON UpdateShipment TO ' +'$(User)')
EXEC('GRANT EXECUTE ON Delete_Shipmment TO ' +'$(User)')
EXEC('GRANT EXECUTE ON register TO '+'$(User)')
EXEC('GRANT EXECUTE ON Login TO ' +'$(User)')
EXEC('GRANT EXECUTE ON AddCreditCard TO ' +'$(User)')
EXEC('GRANT EXECUTE ON DeleteFromSavelist TO ' +'$(User)')
EXEC('GRANT EXECUTE ON AddPaymentMethod TO ' +'$(User)')
EXEC('GRANT EXECUTE ON AddAdress TO ' +'$(User)')
EXEC('GRANT EXECUTE ON deleteAddress TO ' +'$(User)')
EXEC('GRANT EXECUTE ON deletePaymentMethod  TO '+'$(User)')
EXEC('GRANT EXECUTE ON UpdatePaymentMethod  TO '+'$(User)')
EXEC('GRANT EXECUTE ON UpdateAddress TO ' +'$(User)')
EXEC('GRANT EXECUTE ON dataImport TO ' +'$(User)')
EXEC ('GRANT EXECUTE ON changeUserInfo TO '+'$(User)')















