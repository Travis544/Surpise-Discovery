
var express = require("express");
let app = express();
var cors = require("cors");
app.use(cors());
var sql = require('mssql');
const ExcelJS = require('exceljs');
const { load } = require("mime");
var DBSky = DBSky || {};



//*************************************************************************//
//Connect to SQL server and SQL operation
//*************************************************************************//

DBSky.SQLconnecter = class {

    constructor() {
        // enter credentials and server address here
        this._config = {
            server: '',
            database: '',
            user: '',
            password: ''
        };

        this._dbConn = new sql.ConnectionPool(this._config);
    }

    //********************************* */
    // Items
    //********************************** */

    loadItems() {
        return new Promise((resolve, reject) => {

            this._dbConn.connect().then(() => {
                var request = new sql.Request(this._dbConn);
                request.query("SELECT ID, photoURL, ItemName, ItemType, [Item's description], [Item's keyword], SellerUsername, SellerName, SellerEmail, Status from [dbo].[browseItem]").then((result) => { //This is a Joined view.
                    const recordSet = result.recordset;
                    this._dbConn.close();
                    resolve(recordSet)
                }).catch((err) => {
                    //8.
                    this._dbConn.close();
                    reject(err);
                });
            }).catch((err) => {
                //9.
                reject(err);
            });

        })
    }

    loadItem(ID) {
        return new Promise((resolve, reject) => {

            this._dbConn.connect().then(() => {
                // var request = new sql.Request(this._dbConn);
                // request.query("SELECT ID, ItemName, ItemType, [Item's description], [Item's keyword], SellerUsername, SellerName, SellerEmail, SellerReview from [dbo].[browseItem]").then((result) => { //This is a Joined view.
                //     const recordSet = result.recordset;
                //     this._dbConn.close();
                //     resolve(recordSet)
                // }).catch((err) => {
                //     //8.
                //     this._dbConn.close();
                //     reject(err);
                // });
                const ps = new sql.PreparedStatement(this._dbConn);
                ps.input('param', sql.Int)
                ps.prepare("SELECT ID, ItemName, Price, ItemType, [Item's description], [Item's keyword], SellerUsername," +
                    "SellerName, SellerEmail,SellerID, photoURL, Status from [dbo].[browseItem] WHERE ID = @param").then(() => {
                        ps.execute({ param: ID }).then((result) => {
                            ps.unprepare().then().catch((err) => {
                                console.log(err)
                            })
                            if (result.returnValue > 0) {
                                reject("Retrieve failed");
                            }

                            if (!result.recordset && !result.recordset[0]) {
                                reject("Retrieve failed");
                            }
                            const recordSet = result.recordset[0];

                            // console.log(successObject);
                            this._dbConn.close();
                            resolve(recordSet);
                        }).catch((err) => {
                            console.log(err);
                            this._dbConn.close();
                            reject(err);
                        });
                    }).catch((err) => {
                        console.log(err);
                        reject(err);
                    })

            }).catch((err) => {
                //9.
                reject(err);
            });

        })
    }

    addItem(sellerID, name, keyword, type, description, price, photoURL) {
        let ID = null;
        return new Promise((resolve, reject) => {
            this._dbConn.connect().then(() => {
                this._dbConn.connect().then(() => {
                    const ps = new sql.PreparedStatement(this._dbConn)
                    ps.input('sellerIDParam', sql.Int)
                    ps.input('nameParam', sql.NVarChar(40))
                    ps.input('keywordParam', sql.NVarChar(40))
                    ps.input('typeParam', sql.NVarChar(40))
                    ps.input('descriptionParam', sql.NVarChar(400))
                    ps.input('priceParam', sql.Money)
                    ps.input('urlParam', sql.NVarChar(200))
                    ps.output('itemIDParam', sql.Int);
                    ps.prepare('Exec dbo.[addItemToSell] @SellerID=@sellerIDParam, @Name=@nameParam, @Keyword=@keywordParam, @Type=@typeParam, @Description=@descriptionParam, @Price=@priceParam, @Photourl=@urlParam, @ItemID=@itemIDParam output')
                        .then(() => {
                            ps.execute({
                                sellerIDParam: sellerID, nameParam: name, keywordParam: keyword,
                                typeParam: type, descriptionParam: description, priceParam: price, urlParam: photoURL, itemIDParam: ID
                            }).then((result) => {
                                
                                if (result.returnValue > 0) {
                                    reject("Added failed");
                                }

                                ps.unprepare().then(()=>{
                                    this._dbConn.close().then(()=>{
                                        resolve(result.output.itemIDParam);
                                    })
                                }).catch((err) => {
                                    console.log(err);
                                    reject("Added failed");
                                })
                                
                                // console.log(result.recordset[0].value);
                                console.log(result.output);
                               
                            }).catch((err) => {
                                console.log(err);
                                this._dbConn.close().then(()=>{
                                    reject(err);
                                })
                               
                            });
                        }).catch((err) => {
                            this._dbConn.close().then(()=>{
                                reject(err);
                            })
                            console.log(err)
                         
                        })

                })




            }).catch((err) => {
                //9.
                console.log(err);
            });
        })
    }

    //********************************* */
    // User Info
    //********************************** */

    signIn(username) {

        return new Promise((resolve, reject) => {

            this._dbConn.connect().then(() => {
                //!!!!!!!!!!!! Sanitize Input !!!!!!!!!!!!
                const ps = new sql.PreparedStatement(this._dbConn);
                ps.input('param', sql.NVarChar(20))
                ps.prepare('select ID, PasswordSalt, PasswordHash from [dbo].viewLogin(@param)').then(() => {
                    ps.execute({ param: username }).then((result) => {
                        ps.unprepare().then().catch((err) => {
                            console.log(err)
                        })
                        if (result.returnValue > 0) {
                            reject("Login failed");
                        }

                        if (!result.recordset && !result.recordset[0]) {
                            reject("Login failed");
                        }
                        const recordSet = result.recordset[0];
                        const successObject = {
                            ID: recordSet.ID,
                            PasswordSalt: recordSet.PasswordSalt,
                            PasswordHash: recordSet.PasswordHash
                        }
                        // console.log(successObject);
                        this._dbConn.close();
                        resolve(successObject);
                    }).catch((err) => {
                        console.log(err);
                        this._dbConn.close();
                        reject(err);
                    });
                }).catch((err) => {
                    console.log(err);
                    reject(err);
                })

            })

        })
    }



    register(name, username, salt, hash, email, dob) {

        return new Promise((resolve, reject) => {
            this._dbConn.connect().then(() => {
                this._dbConn.connect().then(() => {
                    //!!!!!!!!!!!! Sanitize Input !!!!!!!!!!!!
                    const ps = new sql.PreparedStatement(this._dbConn)
                    ps.input('NameParam', sql.NVarChar(40))
                    ps.input('UsernameParam', sql.VarChar(20))
                    ps.input('DOBParam', sql.DateTime)
                    ps.input('EmailParam', sql.VarChar(50))
                    ps.input('HashParam', sql.VarChar(20))
                    ps.input('SaltParam', sql.VarChar(20))
                    ps.prepare('Declare @ID int; Exec dbo.register @Name=@NameParam, @Username=@UsernameParam, @DOB=@DOBParam, @Email=@EmailParam, @PasswordHash=@HashParam, @PasswordSalt=@SaltParam, @UserID=@ID output')
                        .then(() => {
                            ps.execute({ NameParam: name, UsernameParam: username, SaltParam: salt, HashParam: hash, EmailParam: email, DOBParam: dob }).then((result) => {
                                ps.unprepare().then(()=>{
                                    this._dbConn.close().then(()=>{
                                        resolve(result);
                                    })
                                }).catch((err) => {
                                    console.log(err);
                                    reject("register failed");
                                })
                                
                                if (result.returnValue > 0) {
                                    reject("Register failed");
                                }
                                // this._dbConn.close();
                                resolve();
                            }).catch((err) => {
                                console.log(err);
                                this._dbConn.close();
                                reject(err);
                            });
                        }).catch((err) => {
                            this._dbConn.close();
                            console.log(err)
                            reject(err);
                        })

                })




            }).catch((err) => {
                //9.

                console.log(err);
            });
        })
    }

    userInfo(username) {

        return new Promise((resolve, reject) => {

            this._dbConn.connect().then(() => {
                //!!!!!!!!!!!! Sanitize Input !!!!!!!!!!!!
                const ps = new sql.PreparedStatement(this._dbConn);
                ps.input('param', sql.NVarChar(20))
                ps.prepare('select ID, Name, DOB, Email, PhotoUrl from [dbo].viewUser(@param)').then(() => {
                    ps.execute({ param: username }).then((result) => {
                        ps.unprepare().then().catch((err) => {
                            console.log(err)
                        })
                        if (result.returnValue > 0) {
                            reject("Retrieve failed");
                        }

                        if (!result.recordset && !result.recordset[0]) {
                            reject("Retrieve failed");
                        }
                        const recordSet = result.recordset[0];
                        this._dbConn.close();
                        resolve(recordSet);
                    }).catch((err) => {
                        console.log(err);
                        this._dbConn.close();
                        reject(err);
                    });
                }).catch((err) => {
                    console.log(err);
                    reject(err);
                })

            })

        })
    }

    changeUserInfo(userID, name, email, dob, photoURL) {
        return new Promise((resolve, reject) => {
            this._dbConn.connect().then(() => {
                this._dbConn.connect().then(() => {
                    const ps = new sql.PreparedStatement(this._dbConn)
                    ps.input('NameParam', sql.NVarChar(40))
                    ps.input('UserIDParam', sql.VarChar(20))
                    ps.input('DOBParam', sql.DateTime)
                    ps.input('EmailParam', sql.VarChar(50))
                    ps.input('photoURLParam', sql.VarChar(200))
                    ps.prepare("exec [changeUserInfo] @Name = @NameParam, @DOB = @DOBParam, @Email = @EmailParam , @UserID = @UserIDParam, @photoURL = @photoURLParam")
                        .then(() => {
                            ps.execute({ NameParam: name, UserIDParam: userID, photoURLParam: photoURL, EmailParam: email, DOBParam: dob }).then((result) => {
                                ps.unprepare().then().catch((err) => {
                                    console.log(err)
                                })
                                if (result.returnValue > 0) {
                                    reject("Failed");
                                }
                                this._dbConn.close();
                                resolve();
                            }).catch((err) => {
                                console.log(err);
                                this._dbConn.close();
                                reject(err);
                            });
                        }).catch((err) => {
                            console.log(err)
                            reject(err);
                        })

                })




            }).catch((err) => {
                //9.
                console.log(err);
            });
        })
    }

    //********************************* */
    // Transaction
    //********************************** */

    purchase(itemID, buyerID, paymentMethodID, location, price, address) {
        return new Promise((resolve, reject) => {
            this._dbConn.connect().then(() => {
                this._dbConn.connect().then(() => {
                    const ps = new sql.PreparedStatement(this._dbConn)
                    ps.input('itemIDParam', sql.Int)
                    ps.input('buyerIDParam', sql.Int)
                    ps.input('paymentMethodIDParam', sql.Int)
                    ps.input('locationParam', sql.VarChar(40))
                    ps.input('priceParam', sql.Money);
                    ps.input("addressIDParam",sql.Int);
                    ps.output('BuyIDParam', sql.Int)
                    ps.prepare("exec [dbo].[BuyItem] @ItemID = @itemIDParam, @AddressID_1 = @addressIDParam, @BuyerID = @buyerIDParam, @PaymentMethodID = @paymentMethodIDParam , @Location_1 = @locationParam, @Price_1 = @priceParam, @BuyID = @BuyIDParam output")
                        .then(() => {
                            ps.execute({
                                itemIDParam: itemID, buyerIDParam: buyerID, addressIDParam: address,
                                paymentMethodIDParam: paymentMethodID, locationParam: location, priceParam: price
                            }).then((result) => {
                                ps.unprepare().then(()=>{
                                    this._dbConn.close().then(()=>{
                                        resolve(result);
                                    })
                                }).catch((err) => {
                                    console.log(err);
                                    reject("Added failed");
                                })
                                
                                if (result.returnValue > 0) {
                                    reject("Purchase failed");
                                }
                                this._dbConn.close();
                                resolve();
                            }).catch((err) => {
                                console.log(err);
                                this._dbConn.close();
                                reject(err);
                            });
                        }).catch((err) => {
                            console.log(err)
                            reject(err);
                        })

                })




            }).catch((err) => {
                //9.
                console.log(err);
            });
        })
    }

    sellerTransaction(itemID){
        return new Promise((resolve, reject) => {
            console.log(itemID);
            this._dbConn.connect().then(() => {
                //!!!!!!!!!!!! Sanitize Input !!!!!!!!!!!!
                const ps = new sql.PreparedStatement(this._dbConn);
                ps.input('param', sql.Int)
                ps.prepare('select * from [dbo].sellerTransaction(@param)').then(() => {
                    ps.execute({ param: itemID }).then((result) => {
                        ps.unprepare().then().catch((err) => {
                            console.log(err)
                        })
                        if (result.returnValue > 0) {
                            reject("Retrieve failed");
                        }

                        if (!result.recordset && !result.recordset[0]) {
                            reject("Retrieve failed");
                        }
                        const recordSet = result.recordset[0];
                        console.log(recordSet);
                        this._dbConn.close();
                        resolve(recordSet);
                    }).catch((err) => {
                        console.log(err);
                        this._dbConn.close();
                        reject(err);
                    });
                }).catch((err) => {
                    console.log(err);
                    reject(err);
                })

            })

        })
    }

    updateShipment(trackNum, shippingMethod, transactionID){
        
        return new Promise((resolve, reject) => {
            this._dbConn.connect().then(() => {
                this._dbConn.connect().then(() => {
                    const ps = new sql.PreparedStatement(this._dbConn)
                    ps.input('trackNumParam', sql.NVarChar(20))
                    ps.input('shippingMethodParam', sql.NVarChar(20))
                    ps.input('TransactionIDParam', sql.Int)
                    ps.prepare("exec [dbo].[Updateshipment] @TrackingNumber = @trackNumParam, @ShippingMethod = @shippingMethodParam, @TransactionID = @TransactionIDParam")
                        .then(() => {
                            ps.execute({ trackNumParam: trackNum, shippingMethodParam: shippingMethod, TransactionIDParam: transactionID}).then((result) => {
                                ps.unprepare().then().catch((err) => {
                                    console.log(err)
                                })
                                if (result.returnValue > 0) {
                                    reject("Update failed");
                                }
                                this._dbConn.close();
                                resolve("Update Shipping Information Successfully!");
                            }).catch((err) => {
                                console.log(err);
                                this._dbConn.close();
                                reject(err);
                            });
                        }).catch((err) => {
                            console.log(err)
                            reject(err);
                        })

                })




            }).catch((err) => {
                //9.
                // console.log(err);
                reject(err);
            });
        })
    }

    getMyOrders(userID){
        return new Promise((resolve, reject) => {
            this._dbConn.connect().then(() => {
                const ps = new sql.PreparedStatement(this._dbConn)
                ps.input('userIDParam', sql.Int)
                ps.prepare('SELECT * FROM myOrders(@userIDParam) Order By PurchaseDate desc').then(() => {
                    ps.execute({ userIDParam: userID }).then((result) => {
                        ps.unprepare().then(()=>{
                            this._dbConn.close().then(()=>{
                                console.log(result)
                                resolve(result);
                            }).catch((err)=>{
                                console.log(err)
                            })  
                           
                        }).catch((err) => {
                            console.log(err)
                        })
                      
                    }).catch((err) => {
                        console.log(err);
                        this._dbConn.close();
                        reject(err);
                    });
                }).catch((err) => {
                    this._dbConn.close();
                    console.log(err)
                })
            }).catch((err)=>{
                this._dbConn.close();
                console.log(err)
            })
        })
    }

    //********************************* */
    // ListPage(Item)
    //********************************** */

    deleteItem(itemID,sellerID){
        return new Promise((resolve, reject) => {
            this._dbConn.connect().then(() => {
            const ps = new sql.PreparedStatement(this._dbConn)
            ps.input('itemIDparam', sql.Int)
            ps.input('sellerIDParam',sql.Int)
            ps.prepare('Exec [dbo].[DeleteItem]@ItemID=@itemIDparam,@SellerID=@sellerIDParam').then(() => {
                ps.execute({itemIDparam: itemID, sellerIDParam: sellerID }).then((result) => {
                    ps.unprepare().then().catch((err) => {
                        console.log(err)
                    })
                    this._dbConn.close();
                    console.log(result)
                    resolve(result);
                }).catch((err) => {
                    console.log(err);
                    this._dbConn.close();
                    reject(err);
                });
            }).catch((err) => {
                console.log(err)
            }) 
        })
     })
    }

    updateItem(itemID,sellerID, Name,  Keyword, Type,Description, Price){
        return new Promise((resolve, reject) => {
            this._dbConn.connect().then(() => {
                this._dbConn.connect().then(() => {
                    const ps = new sql.PreparedStatement(this._dbConn)
                    ps.input('itemIDParam', sql.Int)
                    ps.input('sellerIdParam', sql.Int)
                    ps.input('NameParam', sql.NVarChar(40))
                    ps.input('KeywordParam',sql.NVarChar(40))
                    ps.input('TypeParam',sql.NVarChar(40))
                    ps.input('DescriptionParam',sql.NVarChar(40))
                    ps.input('PriceParam',sql.Money)
                    ps.prepare("exec [dbo].[ModifyItem] @itemID = @itemIDParam, @sellerID = @sellerIdParam, @Name = @NameParam, @Keyword = @KeywordParam, @Type=@TypeParam, @Description=@DescriptionParam, @Price = @PriceParam")
                        .then(() => {
                            ps.execute({ itemIDParam: itemID, sellerIdParam: sellerID, NameParam: Name, KeywordParam: Keyword, TypeParam: Type, DescriptionParam: Description,PriceParam: Price  }).then((result) => {
                                ps.unprepare().then().catch((err) => {
                                    console.log(err)
                                })
                                if (result.returnValue > 0) {
                                    reject("Update failed");
                                }
                                this._dbConn.close();
                                resolve("Update item Information Successfully!");
                            }).catch((err) => {
                                console.log(err);
                                this._dbConn.close();
                                reject(err);
                            });
                        }).catch((err) => {
                            console.log(err)
                            reject(err);
                        })

                })
            }).catch((err) => {
                //9.
                // console.log(err);
                reject(err);
            });
        })
    }

    //********************************* */
    // SaveList
    //********************************** */

    getSaveList(id) {
        console.log(id);
        return new Promise((resolve, reject) => {
            this._dbConn.connect().then(() => {
                const ps = new sql.PreparedStatement(this._dbConn)
                ps.input('idParam', sql.Int)
                //I.Name as ItemName, I.ID as ItemID, [I.Price], I.Type
                ps.prepare('SELECt * From dbo.SavedList (@idParam)').then(() => {
                    ps.execute({ idParam: id }).then((result) => {
                        ps.unprepare().then().catch((err) => {
                            console.log(err)
                        })
                        this._dbConn.close();

                        const recordSet = result.recordset;
                        resolve(recordSet);

                    }).catch((err) => {
                        console.log(err + "llllll");
                        this._dbConn.close();
                        reject(err);
                    });
                }).catch((err) => {
                    this._dbConn.close();
                    console.log(err)
                })
            })
        })
    }

    saveItem(userID, itemID) {
        return new Promise((resolve, reject) => {
            this._dbConn.connect().then(() => {
                const ps = new sql.PreparedStatement(this._dbConn)
                ps.input('idParam', sql.Int)
                ps.input('itemParam', sql.Int)
                //I.Name as ItemName, I.ID as ItemID, [I.Price], I.Type
                ps.prepare('Exec dbo.saveItem @BuyerID=@idParam, @ItemID=@itemParam; SELECT * FROM [SAVE]').then(() => {
                    ps.execute({ idParam: userID, itemParam: itemID }).then((result) => {
                        ps.unprepare().then().catch((err) => {
                            // console.log(err)
                        })
                        this._dbConn.close();
                        // console.log(result)
                        resolve("OK");
                    }).catch((err) => {
                        console.log(err);
                        this._dbConn.close();
                        reject(err);
                    });
                }).catch((err) => {
                    this._dbConn.close();
                    console.log(err)
                })
            })
        })
    }

    DeleteFromSaveList(userID, itemID) {
        return new Promise((resolve, reject) => {
            this._dbConn.connect().then(() => {
                const ps = new sql.PreparedStatement(this._dbConn)
                ps.input('idParam', sql.Int)
                ps.input('itemParam', sql.Int)
                ps.prepare('Exec dbo.DeleteFromSaveList @UserID=@idParam, @ItemID=@itemParam; SELECT * FROM [SAVE]').then(() => {
                    ps.execute({ idParam: userID, itemParam: itemID }).then((result) => {
                        ps.unprepare().then().catch((err) => {
                            console.log(err)
                        })
                        this._dbConn.close();
                        console.log(result)
                        resolve("OK");
                    }).catch((err) => {
                        console.log(err);
                        this._dbConn.close();
                        reject(err);
                    });
                }).catch((err) => {
                    this._dbConn.close();
                    console.log(err)
                })
            })
        })
    }
    //     ednd

    //********************************* */
    // Payment
    //********************************** */

    getPaymentMethods(userID) {
        return new Promise((resolve, reject) => {
            this._dbConn.connect().then(() => {
                const ps = new sql.PreparedStatement(this._dbConn)
                ps.input('userIDParam', sql.Int)
                ps.prepare('SELECT * FROM MyPaymentMethod(@userIDParam)').then(() => {
                    ps.execute({ userIDParam: userID }).then((result) => {
                        ps.unprepare().then().catch((err) => {
                            console.log(err)
                        })
                        this._dbConn.close();

                        resolve(result);
                    }).catch((err) => {
                        console.log(err);
                        this._dbConn.close();
                        reject(err);
                    });
                }).catch((err) => {
                    this._dbConn.close();
                    console.log(err)
                })
            })
        })
    }

    

    determinePaymentMethodHelper(type) {
        const ps = new sql.PreparedStatement(this._dbConn)
        ps.input('userIDParam', sql.Int)
        ps.input('typeParam', sql.NVarChar(60))

        if (type.toLowerCase() == 'card') {

            ps.input('cardNumParam', sql.NVarChar(32))
            ps.input('bankParam', sql.NVarChar(40))
            ps.input('expDateParam', sql.DateTime)
            return ps.prepare('EXEC AddPaymentMethod @UserID=@userIDParam, @Type=@typeParam, @CardNumber=@cardNumParam, @Bank=@bankParam, @ExpDate=@expDateParam').then(() => {
                return ps
            })


        } else {
            return ps.prepare('EXEC AddPaymentMethod @UserID=@userIDParam, @Type=@typeParam').then(() => {
                return ps
            })
        }
    }

    addPaymentMethod(userID, type, cardNum, bank, expDate) {
        return new Promise((resolve, reject) => {
            this._dbConn.connect().then(() => {
                this.determinePaymentMethodHelper(type).then((ps) => {
                    //{userIDParam:userID }
                    //@UserID=@userIDParam, @Type=@typeParam, @CardNumber=@cardNumParam, @Bank=@bankParam, @ExpDate=@expDateParam

                    let executionObj = { userIDParam: userID, typeParam: type }
                    if (type.toLowerCase() == 'card') {
                        executionObj = { userIDParam: userID, typeParam: type, cardNumParam: cardNum, bankParam: bank, expDateParam: expDate }
                    }
                    ps.execute(executionObj).then((result) => {
                        ps.unprepare().then(()=>{
                            this._dbConn.close().then(()=>{
                                resolve();
                            })
                        }).catch((err) => {
                            console.log(err);
                            reject("Added failed");
                        })
                        
                        this._dbConn.close();
                        console.log(result)
                        resolve(result);
                    }).catch((err) => {
                        console.log(err);
                        this._dbConn.close();
                        reject(err);
                    });
                })

            }).catch((err) => {
                this._dbConn.close();
                console.log(err)
            })
        })
    }



    updatePaymentMethod(userID, paymentMethodID, type,cardNum, bank, expDate ){ 
    
        let preparedStatmentString='Exec UpdatePaymentMethod @userID=@idParam, @paymentMethodID=@paymentIDParam'
        let execObj={idParam: userID, paymentIDParam:paymentMethodID }
         return new Promise((resolve, reject) => {
            this._dbConn.connect().then(() => {
                const ps = new sql.PreparedStatement(this._dbConn)
               
                //building the prepared statement query. Not directly concatenating user input. 
                if(type!=null&&type!=""){
                   preparedStatmentString=preparedStatmentString+', @type=@typeParam'
                    ps.input('typeParam', sql.NVarChar(60))    
                    execObj.typeParam=type; 
                }
        
                if(cardNum!=null&&cardNum!=""){
                    preparedStatmentString=preparedStatmentString+', @CardNumber=@cardNumParam'
                    ps.input('cardNumParam', sql.NVarChar(32))
                    execObj.cardNumParam=cardNum; 
                }
        
                if(bank!=null&&bank!=""){
                    preparedStatmentString=preparedStatmentString+', @bank=@bankParam'
                    ps.input('bankParam', sql.NVarChar(32))
                    execObj.bankParam=bank;
                }
    
                if(expDate!=null&&expDate!=""){
                    preparedStatmentString=preparedStatmentString+', @expDate=@expDateParam'
                    ps.input('expDateParam', sql.DateTime)
                    execObj.expDateParam=expDate;
                }
    
                ps.input('idParam', sql.Int)
                ps.input('paymentIDParam', sql.Int)
                
            
               console.log(preparedStatmentString)
    
                ps.prepare(preparedStatmentString).then(() => {
                    ps.execute(execObj).then((result) => {
                        ps.unprepare().then().catch((err) => {
                            console.log(err)
                        })
                        this._dbConn.close();
                        console.log(result)
                        resolve(result);
                    }).catch((err) => {
                        console.log(err);
                        this._dbConn.close();
                        reject(err);
                    });
                }).catch((err) => {
                    this._dbConn.close();
                    reject(err);
                }) 
            })
         })
    
    }
    

    DeletePaymentMethod(userID, paymentID) {
        return new Promise((resolve, reject) => {
            this._dbConn.connect().then(() => {
                const ps = new sql.PreparedStatement(this._dbConn)
                ps.input('userIDParam', sql.Int)
                ps.input('paymentIDParam', sql.Int)
                ps.prepare('Exec [dbo].[deletePaymentMethod]@userIDParam,@paymentIDParam').then(() => {
                    ps.execute({ userIDParam: userID, paymentIDParam: paymentID }).then((result) => {
                        ps.unprepare().then().catch((err) => {
                            console.log(err)
                        })
                        this._dbConn.close();
                        console.log(result)
                        resolve(result);
                    }).catch((err) => {
                        console.log(err);
                        this._dbConn.close();
                        reject(err);
                    });
                }).catch((err) => {
                    console.log(err)
                })
            })
        })
    }


    //********************************* */
    // Address
    //********************************** */

    getAddress(userID) {
        return new Promise((resolve, reject) => {
            this._dbConn.connect().then(() => {
                const ps = new sql.PreparedStatement(this._dbConn)
                ps.input('userIDParam', sql.Int)
                ps.prepare('SELECT * FROM MyAddress(@userIDParam)').then(() => {
                    ps.execute({ userIDParam: userID }).then((result) => {
                        ps.unprepare().then().catch((err) => {
                            console.log(err)
                        })
                        this._dbConn.close();
                        console.log(result)
                        resolve(result);
                    }).catch((err) => {
                        console.log(err);
                        this._dbConn.close();
                        reject(err);
                    });
                }).catch((err) => {
                    this._dbConn.close();
                    console.log(err)
                })
            })
        })
    }


    AddAddress(userID, street, city, state, zip, campusMailBox) {
        return new Promise((resolve, reject) => {
            this._dbConn.connect().then(() => {
                const ps = new sql.PreparedStatement(this._dbConn)
                ps.input('idParam', sql.Int)
                ps.input('streetParam', sql.NVarChar(40))
                ps.input('cityParam', sql.NVarChar(40))
                ps.input('stateParam', sql.NVarChar(20))
                ps.input('zipParam', sql.NVarChar(10))
                ps.input('cmbParam', sql.NVarChar(8))
                // 'Declare @ID int; Exec dbo.register @Name=@NameParam, @Username=@UsernameParam, @DOB=@DOBParam, @Email=@EmailParam, @PasswordHash=@HashParam, @PasswordSalt=@SaltParam, @UserID=@ID output
                ps.prepare('Declare @ID int; Exec AddAdress @userID=@idParam, @street=@streetParam, @city=@cityParam, @state=@stateParam, @zip=@zipParam, @campusMailBox=@cmbParam, @AddressID=@ID output ').then(() => {
                    ps.execute({ idParam: userID, streetParam: street, cityParam: city, stateParam: state, zipParam: zip, cmbParam: campusMailBox }).then((result) => {
                        ps.unprepare().then(()=>{
                            this._dbConn.close().then(()=>{
                                resolve(result);
                            })
                        }).catch((err) => {
                            console.log(err);
                            reject("Added failed");
                        })
                        
                        this._dbConn.close();
                        console.log(result)
                        resolve();
                    }).catch((err) => {
                        console.log(err);
                        this._dbConn.close();
                        reject(err);
                    });
                }).catch((err) => {
                    this._dbConn.close();
                    console.log(err)
                })
            })
        })
    }


    updateAddress(userID, addressID, street, city, state, zip, campusMailBox) {
        let preparedStatmentString = 'Exec UpdateAddress @userID=@idParam, @addressID=@addressIDParam'
        let execObj = { idParam: userID, addressIDParam: addressID }


        return new Promise((resolve, reject) => {
            this._dbConn.connect().then(() => {
                const ps = new sql.PreparedStatement(this._dbConn)
                ps.input('idParam', sql.Int)
                ps.input('addressIDParam', sql.Int)

                //building the prepared statement query. Not directly concatenating user input. 
                if (street&&street!="") {
                    preparedStatmentString = preparedStatmentString + ', @Street=@streetParam'
                    ps.input('streetParam', sql.NVarChar(40))
                    execObj.streetParam = street;
                }

                if (city&&city!="") {
                    preparedStatmentString = preparedStatmentString + ', @City=@cityParam'
                    ps.input('cityParam', sql.NVarChar(40))
                    execObj.cityParam = city;
                }

                if (state&&state!="") {
                    preparedStatmentString = preparedStatmentString + ', @State=@stateParam'
                    ps.input('stateParam', sql.NVarChar(20))
                    execObj.stateParam = state;
                }

                if (zip&&zip!="") {
                    preparedStatmentString = preparedStatmentString + ', @Zip=@zipParam'
                    ps.input('zipParam', sql.NVarChar(10))
                    execObj.zipParam= zip;
                }

                if (campusMailBox&&campusMailBox!="") {
                    preparedStatmentString = preparedStatmentString + ', @CampusMailBox=@campusMailBoxParam'
                    ps.input('campusMailBoxParam', sql.NVarChar(8))
                    execObj.campusMailBoxParam = campusMailBox;
                }

                console.log(preparedStatmentString)

                ps.prepare(preparedStatmentString).then(() => {
                    ps.execute(execObj).then((result) => {
                        ps.unprepare().then().catch((err) => {
                            console.log(err)
                        })
                        this._dbConn.close();
                        console.log(result)
                        resolve(result);
                    }).catch((err) => {
                        console.log(err);
                        this._dbConn.close();
                        reject(err);
                    });
                }).catch((err) => {
                    reject(err);
                })
            })
        })
    }

    DeleteAddress(userID, addressID) {
        console.log(addressID)
        return new Promise((resolve, reject) => {
            this._dbConn.connect().then(() => {
                const ps = new sql.PreparedStatement(this._dbConn)
                ps.input('userIDParam', sql.Int)
                ps.input('addressIDParam', sql.Int)
                ps.prepare('Exec [dbo].[deleteAddress] @UID=@userIDParam,@AddrID=@addressIDParam').then(() => {
                    console.log(ps)
                    ps.execute({ userIDParam: userID, addressIDParam: addressID }).then((result) => {
                        ps.unprepare().then().catch((err) => {
                            console.log(err)
                        })
                        this._dbConn.close()
                        console.log(result)
                        resolve(result);
                    }).catch((err) => {
                        console.log(err);
                        this._dbConn.close();
                        reject(err);
                    });
                }).catch((err) => {
                    console.log(err)
                })
            })
        })
    }


   


    addIntoDataBase(name, username, passwordSalt, passwordHash, email, dob, itemName, keyword, type, description, price, photoURL, 
        street, city, state, zip, campusMail, cardType, cardNum, bank, expDate
        ){
            return new Promise((resolve, reject) => {
                this._dbConn.connect().then(() => {
                    const ps = new sql.PreparedStatement(this._dbConn)
                    ps.input('nameParam', sql.NVarChar(20))
                    ps.input('usernameParam', sql.NVarChar(20))
                    ps.input('passwordSaltParam', sql.VarChar(50))
                    ps.input('passwordHashParam', sql.VarChar(5000))
                    ps.input('emailParam', sql.VarChar(50))
                    ps.input('dobParam', sql.Date)
                    ps.input('itemNameParam', sql.NVarChar(40))
                    ps.input('keywordParam', sql.NVarChar(40))
                    ps.input('typeParam', sql.NVarChar(40))
                    ps.input('descriptionParam', sql.NVarChar(400))
                    ps.input('priceParam', sql.Money)
                    ps.input('photoURLParam', sql.NVarChar(200))
                    ps.input('streetParam', sql.NVarChar(40))
                    ps.input('cityParam', sql.NVarChar(40))
                    ps.input('stateParam', sql.NVarChar(20))
                    ps.input('zipParam', sql.NVarChar(10))
                    ps.input('campusMailParam', sql.NVarChar(8))
                    ps.input('cardTypeParam', sql.NVarChar(60))
                    ps.input('cardNumParam', sql.NVarChar(32))
                    ps.input('bankParam', sql.NVarChar(40))
                    ps.input('expDateParam', sql.Date)
                    // 'Declare @ID int; Exec dbo.register @Name=@NameParam, @Username=@UsernameParam, @DOB=@DOBParam, @Email=@EmailParam, @PasswordHash=@HashParam, @PasswordSalt=@SaltParam, @UserID=@ID output
                    ps.prepare('exec dbo.dataImport @name = @nameParam, @username=@usernameParam, @passwordSalt=@passwordSaltParam, @passwordHash = @passwordHashParam, @email = @emailParam, @dob = @dobParam,@itemName = @itemNameParam, @keyword = @keywordParam ,@type = @typeParam, @description = @descriptionParam , @photourl = @photoURLParam, @price =  @priceParam, @street = @streetParam, @city = @cityParam, @state = @stateParam, @zip =  @zipParam, @campusMail = @campusMailParam, @cardType = @cardTypeParam, @cardNum = @cardNumParam, @bank = @bankParam, @expDate =@expDateParam').then(() => {
                        ps.execute({nameParam: name, usernameParam: username,  passwordSaltParam: passwordSalt, 
                        passwordHashParam: passwordHash, emailParam: email, dobParam: dob,  itemNameParam: itemName,
                        keywordParam: keyword, typeParam: type, descriptionParam: description, priceParam: price, photoURLParam: photoURL, 
                        streetParam: street, cityParam: city, stateParam: state, zipParam: zip, campusMailParam: campusMail,
                        cardTypeParam: cardType, cardNumParam: cardNum, bankParam: bank, expDateParam: expDate
                        }).then((result) => {
                            ps.unprepare().then(()=>{
                                this._dbConn.close().then(()=>{
                                    resolve(result);
                                })
                            }).catch((err) => {
                                console.log(err);
                                this._dbConn.close();
                                reject("importData failed");
                            })
                            
                            // console.log(result)
                            resolve();
                        }).catch((err) => {
                            console.log(err);
                            this._dbConn.close();
                            reject(err);
                        });
                    }).catch((err) => {
                        this._dbConn.close();
                        console.log(err)
                    })
                })
            })

    }




}
DBSky.sQLconnecter = new DBSky.SQLconnecter();

//*************************************************************************//
//Ajax
//*************************************************************************//

const logger = require("morgan");
app.use(logger('dev'));//helpful information when requests come in.


var bodyParser = require("body-parser");
app.use('/api/', bodyParser.urlencoded({ extended: true }));
app.use('/api/', bodyParser.json());

app.get('/api/items', (req, res) => { //Read All ITEMS
    DBSky.sQLconnecter.loadItems().then(result => {
        let data = { "result": result };
        // console.log(data);
        res.json(data);
    })

})

app.get("/api/item/id/:id", (req, res) => { //Read One ITEM
    let id = req.params.id;
    DBSky.sQLconnecter.loadItem(id).then(result => {
        let data = { "result": result };
        res.json(data);
    })

    // let result = data[id];
    // res.send(result);
    // res.end();
})

app.post("/api/item", (req, res) => {
    let r = req.body;
    console.log(r);
    DBSky.sQLconnecter.addItem(r.sellerID, r.name, r.keyword, r.type,
        r.description, r.price, r.photoURL).then(response => {
            let data = { ID: response };
            res.json(data);
        }).catch((err) => {
            console.log(err);
            res.json(err);
        });

})
app.delete("/api/deleteItem", (req, res)=>{
    let itemID = req.body.itemID 
    let sellerID = req.body.sellerID
    console.log(itemID, sellerID);

    DBSky.sQLconnecter.deleteItem(itemID,sellerID).then((result)=>{
        res.status(201);
        console.log(result)
        res.json(result);
    }).catch((err)=>{
        console.log("Delete falied")
    })

})

app.put("/api/updateShipment", (req,res)=>{
    let r = req.body;
    console.log(r.ID);
    DBSky.sQLconnecter.updateShipment(r.trackNum, r.shippingMethod, r.transactionID).then((mes)=>{
            res.json(mes)
            res.status(201)
        }).catch((err)=>{
            res.json(err.message)
            res.status(404)
        })
})




app.post("/api/signIn", (req, res) => { //Sign In

    let username = req.body.username;
    let password = req.body.password;
    console.log(username, password);
    DBSky.sQLconnecter.signIn(username).then(result => {
        let ID = result.ID;
        let salt = result.PasswordSalt;
        let hash = result.PasswordHash;
        console.log(ID, salt, hash);
        if (isPasswordCorrect(password, salt, hash)) {
            DBSky.sQLconnecter.userInfo(username).then(result => {
                let data = {
                    "ID": result.ID, "username": username, "Name": result.Name, "DOB": result.DOB
                    , "Email": result.Email, "PhotoUrl": result.PhotoUrl, "status": true
                }
                res.status(201);
                res.json(data);
            }).catch((err) => {
                res.json(err);
            });
        } else {
            let data = { "username": username, "status": false }
            res.status(404);
            res.json(data);
        }
    }).catch((err) => {
        console.log(err);
        res.json(err);
    })

})

//new modifided by 2/4/2021 from Yutong's computer    begin
app.get('/api/SaveList/id/:id', (req, res) => {
    console.log(req.params.id);
    DBSky.sQLconnecter.getSaveList(parseInt(req.params.id)).then(result => {
        console.log(result);
        res.status(200);
        res.send(result);
    }).catch((err) => {
        console.log("savelist falied")
    })
})
app.post("/api/saveItem", (req, res) => {
    let userID = req.body.UserID
    let itemID = req.body.itemID
    DBSky.sQLconnecter.saveItem(userID, itemID).then((result) => {
        res.status(201);
        console.log("Savedsuccess");
        res.json(result);
    }).catch((err) => {
        console.log("saveItem falied")
    })
    //console.log("saveItem yes")
})
app.delete('/api/DeleteFromList/', (req, res) => {
    let userID = req.body.userID
    let itemID = req.body.itemID
    DBSky.sQLconnecter.DeleteFromSaveList(userID, itemID).then((result) => {
        res.status(200);
        console.log("Deletedsuccess");

        console.log(result)
        res.json(result);
    }).catch((err) => {
        console.log("Delete falied")
    })
})

// end
app.put('/api/UpdateItem/id/:id',(req,res)=>{
    console.log(req.params.id) 
    let itemID =  req.params.id
    let sellerID = req.body.sellerID
  
    let Name = req.body.name
    let Type = req.body.type
    let Keyword = req.body.keyword
    let Description = req.body.description
    let Price = req.body.price
    console.log(req.body)
    DBSky.sQLconnecter.updateItem(itemID, sellerID, Name, Keyword,Type, Description, Price).then((result) => {
        console.log(result)
        res.status(201)
        res.send(result)
    }).catch((err) => {
        console.log(err)
        res.status(500)
        res.send(err)
    })

})

app.get('/api/MyPaymentMethod/id/:id', (req, res) => {
    let id = req.params.id;
    DBSky.sQLconnecter.getPaymentMethods(id).then((result) => {
        res.status(200)
        // console.log(result.recordset)
        res.json(result.recordset)
    })

})

app.post('/api/AddPaymentMethod', (req, res) => {
    let userID = req.body.userID
    let type = req.body.type
    let cardNum = req.body.cardNum
    let expDate = req.body.expDate
    let bank = req.body.bank

    //for postman testing
    if (expDate == null || expDate == undefined) {
        expDate = new Date(2072, 11, 24, 0, 0, 0, 0);
    }
    console.log(expDate)
    console.log(cardNum)
    console.log(bank)

    DBSky.sQLconnecter.addPaymentMethod(userID, type, cardNum, bank, expDate).then((result) => {
        res.status(201)
        res.json(result)
        //userID, type, cardNum,bank,expDate
    }).catch((err) => {
        res.status(404)
        res.send(err)
    })

})

app.put('/api/UpdatePaymentMethod/id/:id', (req, res) => {
    let userID = req.params.id
    let paymentMethodID = req.body.paymentMethodID
    let type = req.body.type
    let cardNum = req.body.cardNum
    let bank = req.body.bank
    let expDate = req.body.expDate
    DBSky.sQLconnecter.updatePaymentMethod(userID, paymentMethodID, type, cardNum, bank, expDate).then((result) => {
        console.log(result)
        res.status(201)
        res.send('Update payment method successfully')
    }).catch((err) => {
        console.log(err)
        res.send(err)
    })


})

app.put('/api/UpdateAddress/id/:id', (req, res) => {
    let userID = req.params.id
    let addressID = req.body.addressID
    let street = req.body.street
    let city = req.body.city
    let state = req.body.state
    let zip = req.body.zip
    let campusMailBox = req.body.campusMailBox
    DBSky.sQLconnecter.updateAddress(userID, addressID, street, city, state, zip, campusMailBox).then((result) => {
        res.status(201)
        res.send("Update address successfully")
    }).catch((err) => {
        res.send(err)
    })

})

app.get('/api/MyAddress/id/:id', (req, res) => {
    let id = req.params.id;
    DBSky.sQLconnecter.getAddress(id).then((result) => {
        res.status(200)
        res.json(result.recordset)
    }).catch((err) => {
        res.send(err)
    })

})

app.post('/api/AddAddress', (req, res) => {
    let userID = req.body.userID
    let street = req.body.street
    let city = req.body.city
    let state = req.body.state
    let zip = req.body.zip
    let campusMailBox = req.body.campusMailBox
    DBSky.sQLconnecter.AddAddress(userID, street, city, state, zip, campusMailBox).then(() => {
        res.status(201)
        res.send("success")
    }).catch((err) => {
        res.send(err)
    })
})


app.delete('/api/DeleteAddress', (req, res) => {
    let userID = req.body.userID
    let addressID = req.body.addressID
    console.log(userID)
    DBSky.sQLconnecter.DeleteAddress(userID, addressID).then((result) => {
        res.status(200)
        console.log(result)
        res.json(result)
    })
})
app.delete('/api/DeletePaymentMethod', (req, res) => {
    let userID = req.body.userID
    let paymentID = req.body.paymentID
    DBSky.sQLconnecter.DeletePaymentMethod(userID, paymentID).then((result) => {
        res.status(200)
        console.log(result)
        res.json(result)
    })
})



app.get("/api/myOrders/id/:id", (req,res)=>{
    let userID=req.params.id;
    DBSky.sQLconnecter.getMyOrders(userID)
    .then((result) => {
        console.log(result)
        res.send(result.recordset)
    }).catch((err)=>{
        console.log(err)
    })

})




app.post("/api/importFile", (req, res)=>{
    let data=req.body.fileName;
   let workBook=new ExcelJS.Workbook();
   //s console.log(workBook)
    let userWorkSheet = null
    let itemsWorkSheet=null
    let addressWorkSheet= null
    let paymentWorkSheet= null
    let creditCardWorkSheet=null
    let hasWorkSheet = null
    let saveWorkSheet=null
    let buyWorkSheet = null
    let transWorkSheet=null
    let shipWorkSheet=null
    let c='Book1.xlsx'
    // c='C:/Users/cheny33/Desktop/Book1.xlsx'
    //csv.

	//  workBook.xlsx.readFile(c).\
    
    
    workBook.xlsx.load(data).then((result)=>{
        // console.log( workBook.getWorksheet('Sheet1'));
        // console.log( workBook.getWorksheet('Book1CSV'));
        //console.log(result)
        
        // workBook.addWorksheet('Items' ,result.getWorksheet("Items"))
        userWorkSheet=result.getWorksheet("User")
        itemsWorkSheet=result.getWorksheet("Items")
        addressWorkSheet=result.getWorksheet("Address")
        paymentWorkSheet=result.getWorksheet("PaymentMethod")
        //creditCardWorkSheet=result.getWorksheet("CreditCard")
        //hasWorkSheet=result.getWorksheet("Has")
        saveWorkSheet=result.getWorksheet("Save")
        buyWorkSheet=result.getWorksheet("Buy")
        transWorkSheet=result.getWorksheet("Transaction")
        shipWorkSheet=result.getWorksheet("Shipping")
        //add items
        //console.log(itemsWorkSheet.getRow(2).values)
        //**********************/need to be uncomment*************************
          // *************************************************************/
        let rowCount=itemsWorkSheet.rowCount
        let count=0
        let index;
        for (index=2; index<rowCount+1; index++){ 
            let arr=itemsWorkSheet.getRow(index).values.splice(",") 
            addItemWait(arr)
            console.log(arr[1])       
             
        }
       
        for(index=2; index<userWorkSheet.rowCount+1; index++){
            let arr=userWorkSheet.getRow(index).values.splice(",") 
            addUserWait(arr)
        }
        for(index=2; index<addressWorkSheet.rowCount+1; index++){
            let arr=addressWorkSheet.getRow(index).values.splice(",") 
            addAdressWait(arr)
        }
        for(index=2; index<paymentWorkSheet.rowCount+1; index++){
            let arr=paymentWorkSheet.getRow(index).values.splice(",") 
            addPaymentWait(arr)
        }

        //**********************************************************
       // *************************************************************/  
        for(index=2; index<saveWorkSheet.rowCount+1; index++){
            let arr=saveWorkSheet.getRow(index).values.splice(",") 
            addToSaveWait(arr)
        }
        for(index=2; index<buyWorkSheet.rowCount+1; index++){
            let arr=buyWorkSheet.getRow(index).values.splice(",") 
            buyItemWait(arr)
        }
        res.send("success")
            // let arr=itemsWorkSheet.getRow(2).values.splice(",")        
            //  DBSky.sQLconnecter.AddAddress(parseInt(arr[1]), arr[2], arr[3], arr[4], arr[5],arr[6]).then(()=>{
            // res.send("Success")
            // })
      })
})

const  sleep = async (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

app.post("/api/importFileChanged", (req, res)=>{
    let data=req.body.fileName;
   let workBook=new ExcelJS.Workbook();
   //s console.log(workBook)
    let userWorkSheet = null
    let saveWorkSheet=null
    let buyWorkSheet = null
    let transWorkSheet=null
    let shipWorkSheet=null
    workBook.xlsx.load(data).then((result)=>{
       
        userWorkSheet=result.getWorksheet('Sheet1')
        saveWorkSheet=result.getWorksheet("Save")
        buyWorkSheet=result.getWorksheet("Buy")
        shipWorkSheet=result.getWorksheet("Shipping")
        transWorkSheet=result.getWorksheet("Transaction")

        const doSomething = async () => {

            for(index=2; index<userWorkSheet.rowCount+1; index++){
                let arr = userWorkSheet.getRow(index).values.splice(",")
                // console.log(arr)
                putIntoDataBase(arr, () => {
                    res.json("Error!")
                })
                console.log("User: "+index);
                await sleep(1500);
                
            }

            await sleep(2000);

            for(index=2; index<saveWorkSheet.rowCount+1; index++){
                let arr=saveWorkSheet.getRow(index).values.splice(",") 
                addToSaveWait(arr);
                console.log("save: "+ index);
                await sleep(1200);
            }

            await sleep(2000);

            for(index=2; index<buyWorkSheet.rowCount+1; index++){
                let arr=buyWorkSheet.getRow(index).values.splice(",") 
                buyItemWait(arr);
                console.log("Buy: "+index);
                await sleep(1200);
            }

            await sleep(2000);

            for(index=2; index<shipWorkSheet.rowCount+1; index++){
                let arr=shipWorkSheet.getRow(index).values.splice(",") 
                addShipping(arr);
                console.log("Shipping: " + index);
                await sleep(1200);
            }

            console.log("Done");
        }

        doSomething();
        

        // setTimeout(()=>{
        //     for(index=2; index<saveWorkSheet.rowCount+1; index++){
        //         let arr=saveWorkSheet.getRow(index).values.splice(",") 
        //         addToSaveWait(arr)
        //     }
        //     for(index=2; index<buyWorkSheet.rowCount+1; index++){
        //         let arr=buyWorkSheet.getRow(index).values.splice(",") 
        //         buyItemWait(arr)
        //     }
        //     for(index=2; index<shipWorkSheet.rowCount+1; index++){
        //         let arr=shipWorkSheet.getRow(index).values.splice(",") 
        //         addShipping(arr)
        //     }
        // },1800)



        resolve("Succeed!")
        })

        
    

})




async function putIntoDataBase(arr, error){
        
        let password = arr[3]
        let newsalt = getNewSalt();
        let newhash= hashPassword(password, newsalt);
        await  DBSky.sQLconnecter.addIntoDataBase(arr[1], arr[2], newsalt, newhash, arr[4], arr[5], arr[6], arr[7], arr[8],  arr[9],
            arr[10], arr[11],  arr[12],  arr[13],  arr[14],  arr[15],  arr[16],  arr[17],  arr[18],  arr[19],  arr[20]
            ).then(() => {
                
            }).catch((err) => {
                error();
            })
            
        
    
}



async function addItemWait(arr){
    await  DBSky.sQLconnecter.addItem(parseInt(arr[1]), arr[2], arr[3], arr[4], arr[5], arr[6], arr[7], arr[8])
}
async function addUserWait(arr){
    let password = arr[3]
    let newsalt = getNewSalt();
    let newhash= hashPassword(password, newsalt);
    let email =arr[4]
    await  DBSky.sQLconnecter.register((arr[1]), arr[2], newsalt, newhash, email, arr[5])
}
async function addAdressWait(arr){
    await  DBSky.sQLconnecter.AddAddress((arr[1]), arr[2], arr[3], arr[4], arr[5], arr[6])
}
async function addPaymentWait(arr){
    await  DBSky.sQLconnecter.addPaymentMethod((arr[1]), arr[2], arr[3], arr[4], arr[5])
}
// async function addCreditCardWait(arr){
//     await  DBSky.sQLconnecter.addPaymentMethod(parseInt(arr[1]), 'Card', arr[3], arr[4], arr[5])
// }
async function addToSaveWait(arr){
    await  DBSky.sQLconnecter.saveItem(parseInt(arr[1]), arr[2]).then(() => {
                
    }).catch((err) => {
        error();
    })
}
async function buyItemWait(arr){
    await  DBSky.sQLconnecter.purchase((arr[1]), arr[2], arr[3], arr[4], arr[5], arr[6]).then(() => {
                
    }).catch((err) => {
        error();
    })
}
async function addShipping(arr){
    await  DBSky.sQLconnecter.updateShipment(arr[1], arr[2], parseInt(arr[3])).then(() => {
                
    }).catch((err) => {
        error();
    })
}


app.post("/api/register", (req, res) => {

    // loadItem(()=>{
    //     console.log(string);
    //     res.send({str: string});
    //     res.end(); 
    // });
    let name = req.body.name;
    let username = req.body.username;
    let password = req.body.password;
    let email = req.body.email;
    let dob = req.body.dob;
    let salt = getNewSalt();
    let hash = hashPassword(password, salt);


    console.log(salt, hash);
    DBSky.sQLconnecter.register(name, username, salt, hash, email, dob).then(result => {

        //TODO: Add check password and return to frontend.
        console.log("You have successfully registered.");
        let data = { "username": username };
        res.status(201);
        res.json(data);
    }).catch((error) => {
        console.log(error);
        
    });

})

app.put("/api/updateUserInfo", (req, res) => { //Change User Information 
    
    let r = req.body;
    // console.log(r.ID);
    DBSky.sQLconnecter.changeUserInfo(r.ID, r.name, r.email, r.DOB, r.URL)
    .then(() => {
        res.json();
        res.status(201);
    }).catch((err) => {
        res.json(err);
    });
    
    
})

app.post("/api/purchase", (req, res) => {
    let r = req.body;
    console.log(r)
    console.log(r.address)
    DBSky.sQLconnecter.purchase(r.itemID, r.buyerID, r.paymentMethodID, r.location, r.price, r.addressID)
    .then(() => {
        res.json("Successfully purchased");
    }).catch((err) => {
        console.log(err);
        res.json("Failed");
    })
})

app.get("/api/getsellTransaction/itemID/:itemID",(req, res) => {
    let itemID = req.params.itemID;
    console.log(itemID);

    DBSky.sQLconnecter.sellerTransaction(itemID)
    .then((result) => {
        res.json(result);
        res.status(201);
    }).catch((err) => {
        res.json(err);
    });
})






//*************************************************************************//
// Password Hashing
//*************************************************************************//
var pbkdf2 = require('pbkdf2')
var crypto = require("crypto");
const { waitForDebugger } = require("inspector");
const { resolve } = require("path");



function getNewSalt() {
    let length = 16;
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0, length);   /** return required number of characters */
}


function hashPassword(password, salt) {
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password.toString());
    var value = hash.digest('hex').toString();
    return value.substring(0, 16); //It is too long. I have to truncate it manually.
}

function isPasswordCorrect(password, salt, hash) {
    return hash == hashPassword(password, salt);
}

// DBSky.sQLconnecter.addItem(3, "Beautiful Socks", "Clothes", "Default", "Nice One!", 123, "https://cdn.shopify.com/s/files/1/0052/7237/1293/products/1024x1024-Socks-White-LB1_1024x1024.jpg?v=1561393817")


app.listen(3000);
