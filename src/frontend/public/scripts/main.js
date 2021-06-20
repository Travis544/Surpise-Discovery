// /**
//  * @fileoverview
//  * Provides the JavaScript interactions for all pages.
//  *
//  * @author 
//  * PUT_YOUR_NAME_HERE
//  *



// const { response } = require("express");

// /** namespace. */
var rhit = rhit || {};
// rhit.FB_COLLECTION_POSTS = "Posts";
// rhit.FB_COLLECTION_USERS = "Users";
// rhit.FB_KEY_DESCRIPTION = "Description";
// rhit.FB_KEY_CONDITION = "Condition";
// rhit.FB_KEY_IMAGE_URL = "imageUrl";
// rhit.FB_KEY_TYPE = "Type";
// rhit.FB_KEY_NAME = "Name";
// rhit.FB_KEY_LAST_TOUCHED = "lastTouched";
// rhit.FB_KEY_OWNER = "Owner";
// rhit.fbItemsManager = null;
// rhit.fbDetailItemManager = null;
// rhit.fbSavedListManager = null;
// rhit.fbMyPostManager = null;
// rhit.inListingPage = false;
// rhit.searchWord = null;
// /** globals */
// rhit.variableName = "";

// Express Connection
const apiURL = "http://localhost:3000/api/";





// rhit.startFirebaseUI = () => {
// 	// FirebaseUI config.
// 	var uiConfig = {
// 		signInSuccessUrl: '/',
// 		signInOptions: [
// 			// Leave the lines as is for the providers you want to offer your users.
// 			firebase.auth.GoogleAuthProvider.PROVIDER_ID,
// 			firebase.auth.EmailAuthProvider.PROVIDER_ID,
// 			firebase.auth.PhoneAuthProvider.PROVIDER_ID,
// 			firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
// 		]

// 	};

// 	var ui = new firebaseui.auth.AuthUI(firebase.auth());
// 	// The start method will wait until the DOM is loaded.
// 	ui.start('#firebaseui-auth-container', uiConfig);
// }

// rhit.startDictation = () => {


// 	if (window.hasOwnProperty('webkitSpeechRecognition')) {

// 		let dimmer = $('.dimmer');
// 		var recognition = new webkitSpeechRecognition();
// 		recognition.continuous = false;
// 		recognition.interimResults = false;
// 		recognition.lang = "en-US";
// 		recognition.start();
// 		dimmer.show();

// 		$(".wrapper").click(() => {
// 			console.log("Stoped");
// 			recognition.stop();
// 			dimmer.hide();
// 		});

// 		recognition.onresult = function (e) {
// 			document.getElementById('searchBox').value = e.results[0][0].transcript;
// 			recognition.stop();
// 			dimmer.hide();
// 			// document.getElementById('labnol').submit();
// 		};
// 		recognition.onerror = function (e) {
// 			recognition.stop();
// 			dimmer.hide();
// 		}
// 	}
// }

rhit.setCookie = (cookieName, value, days) => {    //封装一个设置cookie的函数
	var oDate = new Date();
	oDate.setDate(oDate.getDate() + days);   //days为保存时间长度
	document.cookie = cookieName + '=' + value + ';expires=' + oDate;
	console.log(document.cookie);
}

rhit.getCookie = (cookieName) => {
	var arr = document.cookie.split(';');
	for (var i = 0; i < arr.length; i++) {
		var arr2 = arr[i].split('=');
		if (arr2[0] == cookieName) {
			console.log(arr2[1]);
			return arr2[1];  //找到所需要的信息返回出来
		}
	}
	return '';        //找不到就返回空字符串
}
// https://blog.csdn.net/yzxzsp11/article/details/50610369

//Page Controller Begins
rhit.HomePageController = class {
	constructor() {

		if(rhit.authManager.isSignedIn){
			if(rhit.authManager.photoURL){
				$("#account").html(`<img src='${rhit.authManager.photoURL}'>`);
			}
		}

		$("#account").click(() => {
			if (!rhit.authManager.isSignedIn) {
				window.location.href = `loginPage.html`;
			} else {
				window.location.href = `accountPage.html`;
			}
		})



		$("#myListButton").click(() => {
			if (!rhit.authManager.isSignedIn) {
				window.location.href = `loginPage.html`
			} else {
				window.location.href = "savedList.html";
			}
		});

		$("#searchSelect").change(() => {
			$("#searchBox").attr('placeholder', $("#searchSelect").val());
		});


		$("#mainPage").keydown(function (event) {
			if (event.keyCode == "13") {
				let select = $("#searchSelect").val();
				let input = $("#searchBox").val();
				console.log(input);
				if (select == "Search by Name") {
					console.log("Name");
					$("#searchBox").attr("name", "name");
					window.location.href = `listPage.html?name=${input}`;
				} else if (select == "Search by User ID") {
					console.log("Here");
					$("#searchBox").attr("name", "uid");
					window.location.href = `listPage.html?uid=${input}`;
				} else if (select == "Search by Category") {
					$("#searchBox").attr("name", "category");
					window.location.href = `listPage.html?category=${input}`;
				} else if (select == "Search by Owner Name") {
					$("#searchBox").attr("name", "ownername");
					window.location.href = `listPage.html?ownername=${input}`;
				}
			}
		});

		$("#category").click(() => {

				// console.log("clicked");
				window.location.href = "CategoryPage.html";


		});
		this.input=	document.querySelector("#upload")
		this.input.addEventListener('click', this.getFile);
	}

	
	getFile(){
		console.log(document.querySelector("#FileBox").files[0])
		let fileReader=new FileReader()
		fileReader.readAsArrayBuffer(document.querySelector("#dataImport").files[0])
	// 	let buffer=null;
	// 	fileReader.onload=(e)=>{
	// 		buffer=e.target.result
	// 		console.log(buffer)
		
		
	// }


	fileReader.onload = (e) =>{
		console.log("I WORK d")
		var data = "";
		var bytes = new Uint8Array(e.target.result);
		for (var i = 0; i < bytes.byteLength; i++) {
			data += String.fromCharCode(bytes[i]);
		}

		let data2 = {
			"fileName":data
		};
		fetch(apiURL+"importFileChanged", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data2)
		}).then(response => response.json()).then((data) => {
			alert(data);
		})
		.catch((err) => {
			console.log(err);
			alert(err)
		});
		
	};
	}



}


rhit.SellTransactionPageController = class{
	constructor(){
		rhit.sellTransactionManager.loadTransaction(this.updateView.bind(this));
		rhit.fbDetailItemManager.loadItem(this.updateDetail.bind(this));
	}

	updateView(){
		let s = rhit.sellTransactionManager;
		$("#buyer").html("Buyer Name: " + s.buyerName);
		$("#buyerEmail").html("Buyer Email: " + s.buyerEmail);
		$("#purchaseTime").html("Purchase Time: " + s.pTime.substring(0,10));
		$("#Price").html("Price: " + s.price);
		if(s.location == "Shipping"){
			$("#trackingNum").val(s.trackNum);
			$("#shipMethod").val(s.shippingMethod)
			$("#addressDetail").html(
				`<div class = "addressName paymentMethod">
				<div class="aContainer">				
					<p class="">Street: ${s.street}	</p>
					<p class="">City: ${s.city}	</p>
					<p class="">Zip: ${s.zip}	</p>
					<p class="">State: ${s.state}	</p>
					<p class="">Campus Mailbox: ${s.CM}	</p>
				</div>
			</div>`
			);
			$("#pickupDetail").hide();
			$("#submitTransactionInfo").click(() => {
				this.updateShipment();
			});
			$(".shipping").show();
		}else{
			$(".shipping").hide();
			$("#pickupDetail").html("Location: "+ s.location);
			$("#submitTransactionInfo").hide();
		}
	}

	updateDetail(){
		let d = rhit.fbDetailItemManager;
		if(!rhit.authManager.isSignedIn || d.Owner.toLowerCase() != rhit.authManager.username.toLowerCase()){
			// window.history.back(-1);
		}
		$("#Name").html("Item: " + d.Name);
		$("img").attr("src", d.url);
		$("#sellTransactionPage").show();

	}

	updateShipment(){
		let traNum = $("#trackingNum").val();
		let shipMethod = $("#shipMethod").val();

		rhit.sellTransactionManager.updateShipment(traNum, shipMethod);
	}
}





rhit.CategoryPageController = class{
	constructor(){
		console.log("HEreS");
		$("#category").css("color", "#FF5722");
		$("#discovery").css("color", "grey");

		if(rhit.authManager.isSignedIn){
			if(rhit.authManager.photoURL){
				$("#account").html(`<img src='${rhit.authManager.photoURL}'>`);
			}
		}

		$("#account").click(() => {
			if (!rhit.authManager.isSignedIn) {
				window.location.href = `loginPage.html`;
			} else {
				window.location.href = `accountPage.html`;
			}
		})

		$("#myListButton").click(() => {
			if (!rhit.authManager.isSignedIn) {
				window.location.href = `loginPage.html`
			} else {
				window.location.href = "savedList.html";
			}
		});
		$("#discoveryButton").click(() => {
			
				window.location.href = "index.html";
			
		});

		// $("#Food").click(() => {
		// 	window.location.href = `listPage.html?category=Food`;
		// });

	}
}


rhit.ListPageController = class {
	constructor(uid, itemName) {
		console.log(uid, itemName);
		this._uid = uid;
		this._itemName = itemName;
		if (uid && uid == rhit.authManager.uid) {
			console.log("Here");
			$("#ListPageTitle").text("My Post");
		} else {
			$("#ListPageTitle").html("Browse Items");
		}

		if (rhit.authManager.isSignedIn) {
			if (rhit.authManager.photoURL) {
				$("#account").html(`<img src='${rhit.authManager.photoURL}'>`);
			}
		}

		$("#account").click(() => {
			if (!rhit.authManager.isSignedIn) {
				window.location.href = `loginPage.html`
			} else {
				window.location.href = `accountPage.html`
			}
		})

		document.querySelector("#fab").addEventListener("click", (event) => {
			if (!rhit.authManager.isSignedIn) {
				window.location.href = `loginPage.html`
			} else {
				window.location.href = `addItem.html`
			}
		});



		// $("#labnol").submit(() => {

		// });

		rhit.fbItemsManager.loadItems(this.updateList.bind(this));


	}

	updateList() {
		let regexa = null;
		let regexb = null;
		let regexc = null;
		//Make sure it only matches the whole thing
		console.log(`Num of items = ${rhit.fbItemsManager.length}`);
		if (rhit.searchWord && rhit.searchWord.length < 15) {
			$("#ListPageTitle").html(rhit.searchWord);
		}

		if (this._itemName) {
			regexa = new RegExp("\\s" +this._itemName+"\\s", 'i');
			regexb = new RegExp("^" + this._itemName, 'i');
			regexc = new RegExp(this._itemName + "$", 'i');
			// console.log(regex1, regex2, regex3);
		}

		// new List 
		const newList = htmlToElement(' <div id="Container"></div>');
		for (let i = 0; i < rhit.fbItemsManager.length; i++) {
			const item = rhit.fbItemsManager.getItemAtIndex(i);

			
			//Filtering result
			if (this._uid && rhit.authManager.username.toLowerCase() != item.SellerUsername.toLowerCase()){
				continue;
			}
			
			if (!this._uid && item.Status.toLowerCase() != "unsold"){
				continue;
			}

			if (regexa && !regexa.test(item.ItemName) && !regexb.test(item.ItemName) && !regexc.test(item.ItemName)) {
				if (regexa && !regexa.test(item["Item's keyword"]) && !regexb.test(item["Item's keyword"]) && !regexc.test(item["Item's keyword"])) {
					continue;
				}
			}
			let sold = null;
			if (item.Status != "unsold"){
				sold = "Sold";

			}
			const newItem = this._createItem(item, sold);

			newItem.onclick = (event) => {
				// console.log(`you clicked on ${item.ID}`);
				window.location.href = `./DetailPage.html?id=${item.ID}`;
				console.log("you are in the detail page");

			}
			newList.appendChild(newItem);
		}
		const oldList = document.querySelector("#Container");
		// Put in the new quoteListContainer
		oldList.removeAttribute("id");
		oldList.hidden = true;
		if (newList.innerHTML == "") {
			newList.innerHTML = "<div class='h5'>Oops...The list is empty.</div>";
		}
		oldList.parentElement.appendChild(newList);

	}
	_createItem(Post, needtoShip) { //Changed
		return htmlToElement(` <div class = "post px-0 my-4">
		<img style = "border-radius: 2em;" src="${Post.photoURL}"alt="${Post.ItemName}">
		<div class="text-center h2 col-7" style="padding-right: 10%;"> <div>${Post.ItemName}</div> <div style="color: red"> ${needtoShip || " "}</div> </div>
		</div>`);
	};


}

rhit.AddressController=class{
	constructor(select){
		this.currentAddressID=null;
		this._select = select;
		rhit.addressManager.getAddress(this.updateView.bind(this))
		document.querySelector("#addAddress").onclick=()=>{

			let street=document.querySelector("#streetInput").value
			let city=document.querySelector("#cityInput").value
			let state=document.querySelector("#stateInput").value
			let zip=document.querySelector("#zipInput").value
			let campusMailBox=document.querySelector("#campusMailBoxInput").value
			let form = document.querySelector('#addModalForm');
			let isValidForm = form.checkValidity();

			if(isValidForm){
					$('#addModal').modal('hide')
					rhit.addressManager.addAddress(this.updateView.bind(this),  street, city, state, zip,campusMailBox)
			}else{
				return 
			}
			
		}
		$("#AddressTitle").click(()=> 
		window.location.href = "index.html"
	)
		
		document.querySelector("#updateAddress").onclick=()=>{

			let street=document.querySelector("#streetUInput").value
			let city=document.querySelector("#cityUInput").value
			let state=document.querySelector("#stateUInput").value
			let zip=document.querySelector("#zipUInput").value
			let campusMailBox=document.querySelector("#campusMailBoxUInput").value
			
			let form = document.querySelector('#updateModalForm');
			let isValidForm = form.checkValidity();

			if(isValidForm){
					$('#updateModal').modal('hide')
					rhit.addressManager.updateAddress(this.updateView.bind(this), this.currentAddressID, street, city, state, zip,campusMailBox)
			}else{
				return 
			}
			
		}

		
		document.querySelector("#deleteAddress").onclick=()=>{
			rhit.addressManager.deleteAddress( this.currentAddressID,this.updateView.bind(this))
		}


		
	}


	updateView(){
		const newList = htmlToElement(' <div id="addressContainer"></div>');
		console.log(rhit.addressManager.length)
		for (let i = 0; i < rhit.addressManager.length; i++) {
			const address=rhit.addressManager.getAddressAtIndex(i);
			const card = this._createCard(address);
			newList.appendChild(card);
			
		}

		const oldList = document.querySelector("#addressContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		if (newList.innerHTML == "") {
			newList.innerHTML = "<div class='h5'>Oops...The list is empty.</div>";
		}

		oldList.parentElement.appendChild(newList);
		if(this._select){
			$(".selectButton").show();
		}

	}

	_createCard(address) {
		
		const elem= htmlToElement(`  
		<div class = "addressName paymentMethod">
			<div class="aContainer">
				<p>Address ID: ${address.ID}</p>
				<p class="">Street: ${address.Street}	</p>
				<p class="">City: ${address.City}	</p>
				<p class="">Zip: ${address.Zip}	</p>
				<p class="">State: ${address.State}	</p>
				<p class="">Campus Mailbox: ${address.CampusMailBox}</p>
			</div>
		</div>
		`
	);

	let buttonContainer=htmlToElement('<div class="buttonContainer"></div>')
	let deleteButton=htmlToElement('<button class="btn paymentButton  cButton" data-toggle="modal" data-target="#deleteModal">Delete Address</button>')
	let selectButton=htmlToElement(`<button class="btn paymentButton selectButton" >Select Address</button>`)
	let updateButton=htmlToElement(`<button data-index=${address.ID} class="btn paymentButton cButton" data-toggle="modal" data-target="#updateModal">Update Address</button>`)
	buttonContainer.append(updateButton)
	buttonContainer.append(deleteButton)
	buttonContainer.append(selectButton)

		updateButton.onclick=()=>{
			this.currentAddressID=address.ID
			document.querySelector("#streetUInput").value=address.Street
			document.querySelector("#cityUInput").value=address.City
			document.querySelector("#stateUInput").value=address.State
			document.querySelector("#zipUInput").value=address.Zip
			document.querySelector("#campusMailBoxUInput").value=address.CampusMailBox

			
		}

		deleteButton.onclick=()=>{
			this.currentAddressID=address.ID
		}


	elem.querySelector(".aContainer").appendChild(buttonContainer);
	selectButton.onclick = () => {
		sessionStorage.setItem("address", JSON.stringify(address));
		window.history.back(-1);
	}


	return elem;

	}
}

rhit.DetailPageController = class { //Changed
	constructor(id) {
		this._id  =id;
		// if (rhit.authManager.saveList.includes(id)) {
		// 	$("#likeIcon").html("favorite");
		// } else {
		// 	$("#likeIcon").html("favorite_border");
		// }

		if(rhit.authManager.isSignedIn){
			if(rhit.authManager.photoURL){
				$("#account").html(`<img src='${rhit.authManager.photoURL}'>`);
			}
		}
	
		$("#account").click(() => {
			if (!rhit.authManager.isSignedIn) {
				window.location.href = `loginPage.html`
			} else {
				window.location.href = `accountPage.html`
			}
		})
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		const itemID = urlParams.get('id')
		// const queryString = window.location.search;
		// 		const urlParams = new URLSearchParams(queryString);
		// 		const itemID = urlParams.get('id')
		// 		console.log(rhit.authManager.uid)

		// let doesExist=false
		// for(let item of rhit.fbSavedListManager.data){
		// 	if(item.ItemID==itemID){
		// 		$("#likeIcon").html("favorite_border");
		// 			doesExist=true;
		// 		}
		// 	$("#likeIcon").html("favorite");			
		// 	console.log(item.ItemID==itemID);
		// }	

		$("#favoriteBut").click(() => {
			if (!rhit.authManager.isSignedIn) {
				window.location.href = `loginPage.html`
			}
			else {
				
				console.log(rhit.authManager.uid)
					let doesExist=false
					for(let item of rhit.fbSavedListManager.data){
						if(item.ItemID==itemID){
							
							doesExist=true;
						}
						console.log(item.ItemID==itemID);
					}	

					
					if(doesExist){
							// console.log("already exit")
							
							 rhit.fbSaveItemsManager.deleteItem(rhit.authManager.uid, itemID);
							 
							// can do delete here 
					}else{
							 rhit.fbSaveItemsManager.saveItem(rhit.authManager.uid, itemID);
							
					}
				// if (rhit.fbSavedListManager.includes(itemID)) {
				// 	console.log("Already exists");
				// } else {
				// 	rhit.fbSaveItemsManager.saveItem(rhit.authManager.uid, itemID);
				// }



				

			}
		})
		

		$("#menuEdit").click(() => {
			if (rhit.authManager.isSignedIn) {
				
				let itemInfo={
				Price:rhit.fbDetailItemManager.price,
				ID:rhit.fbDetailItemManager.ID,
				Email:rhit.fbDetailItemManager.Email,
				Name:rhit.fbDetailItemManager.Name,
				Owner:rhit.fbDetailItemManager.SellerID,
				URL:rhit.fbDetailItemManager.url,
				Keyword:rhit.fbDetailItemManager.keyword,
				Type:rhit.fbDetailItemManager.Type,
				Desc:rhit.fbDetailItemManager.Description

				}
				console.log(rhit.fbDetailItemManager.SellerID+"FUN")
				sessionStorage.setItem("Item",JSON.stringify(itemInfo)  )
				window.location.href = `addItem.html?id=${id}&edit=1`;
			}
		})


	
		// $("#submitDeleteItem").click((event) => {
		// 	rhit.fbDetailItemManager.delete().then(() => {
		// 		window.history.back(-1);
		// 	}).catch((error) => {
		// 		console.log('Error');
		// 	});;
		// });

		$("#submitDeleteItem").click((event) => {
			console.log(itemID,rhit.authManager.uid);
			rhit.fbDetailItemManager.delete(itemID, rhit.authManager.uid, () => {
				alert("Item Deleted!")	
				window.history.back(-1);
			});
		});
		
		rhit.fbDetailItemManager.loadItem(this.updateView.bind(this)).then(()=>{
			rhit.fbSavedListManager.getSaveList().then(()=>{
				this.checkIfInSaveList()
			})
			
		
		})
	}

	updateView() {
		if (rhit.fbDetailItemManager._documentSnapshot == null) {
			return;
		}
		document.getElementById("Price").innerText = `Price: ${rhit.fbDetailItemManager.price}`;
		document.getElementById("itemId").innerText = `Item ID: ${rhit.fbDetailItemManager.ID}`;
		document.getElementById("Email").innerText = `Email: ${rhit.fbDetailItemManager.Email}`;
		document.getElementById("Name").innerText = `Name: ${rhit.fbDetailItemManager.Name}`;
		document.getElementById("Owner").innerText = `Owner: ${rhit.fbDetailItemManager.Owner}`;
		// document.getElementById("Email").innerText = `Owner:${rhit.fbDetailItemManager.Email}`;
		document.getElementById("Status").innerText = `Status: ${rhit.fbDetailItemManager.Status}`;
		document.getElementById("Description").innerText = `Description: ${rhit.fbDetailItemManager.Description}`;
		document.getElementById("myImg").src = rhit.fbDetailItemManager.url;
		document.getElementById("OwnerName").innerText = `Owner Name: ${rhit.fbDetailItemManager.Ownername}`;
		if (rhit.fbDetailItemManager.Owner.toLowerCase()  == rhit.authManager.username.toLowerCase() ) {
			document.querySelector("#edit").style.display = "flex";
			$("#favoriteBut").hide();
			$('#contactBut').html("This is yours.");
			$("#contactBut").click(() => {
				alert("Nice item!");
	
			})

			if(rhit.fbDetailItemManager.Status.toLowerCase() != "unsold"){
				$("#Status").css("color", "Red");
				$("#transactBut").show();
				$("#transactBut	").click(() => {
					window.location.href = `sellTransaction.html?id=${this._id}`
				});
				$("#edit").hide();
			}			

		}else{
			$("#contactBut").click(() => {
				if (!rhit.authManager.isSignedIn) {
					window.location.href = `loginPage.html`;
				}else{
					window.location.href = `purchasePage.html?id=${this._id}`;
	
				}
	
			})
		}
	}

	checkIfInSaveList(){
		const queryString = window.location.search;
				const urlParams = new URLSearchParams(queryString);
				const itemID = urlParams.get('id')
				console.log(rhit.authManager.uid)
					let doesExist=false
					for(let item of rhit.fbSavedListManager.data){
						if(item.ItemID==itemID){
							
							doesExist=true;
						}
						//console.log(item.ItemID==itemID);
					}	

					
			if(doesExist){
				$("#likeIcon").html("favorite");
			}
	}

	

}
rhit.PaymentMethodController=class{
	constructor(select){
		this._select = select;
		this.currentType=null
		this.oldDate=null
		this.currentPaymentID=null
		rhit.paymentMethodManager.getPaymentMethods(this.updateView.bind(this))
		$('#updateModal').on("show.bs.modal",  (event)=> {
			
			// document.querySelector("#inputMovie").value="";
			
		})

		document.querySelector("#deleteMethodButton").onclick=()=>{
			console.log(this.currentPaymentID)
			rhit.paymentMethodManager.deletePayment(this.currentPaymentID, this.updateView.bind(this))
		}
	

		// //post animation
		// $('#addQuoteDialog').on("shown.bs.modal",  (event)=> {
		// 	document.querySelector("#inputQuote").focus();
		// })
		document.querySelector("#paymentMethodToggle").onclick=(event)=>{
			this.togglePaymentHelper(event)
		}

		document.querySelector('#addPayment').onclick=(event)=>{
			const isCard=$("#paymentMethodToggle").data("card");
			let type=null
			let cardNum=null
			let bank=null
			let expDate=null
			

			if(isCard==0){
				type=document.querySelector("#addOtherPaymentTypeSelection").value
				//console.log(type)
				rhit.paymentMethodManager.addPaymentMethod(this.updateView.bind(this),type,cardNum,bank,expDate )
				$('#addModal').modal('hide')
			}else if(isCard==1){
				type='Card'
				cardNum=document.querySelector("#inputAddCardNum").value
				bank=document.querySelector("#inputAddBank").value
				expDate=document.querySelector("#inputAddDate").value
				let form = document.querySelector('#addModalForm');
				let isValidForm = form.checkValidity();

				if(isValidForm){
					$('#addModal').modal('hide')
				}else{
					return
				}
				
				// if(cardNum==""||bank==""||expDate==""){
				// 	alert("Fill out the required fields")
				// 	return;
				// }
				// if(bank.length<9){
				// 	alert("Please enter a valid credit card")
				// }
				console.log("CARD")
				rhit.paymentMethodManager.addPaymentMethod(this.updateView.bind(this),type,cardNum,bank,expDate )
			}	
		}		
		this.selection=` <select class="form-control" id="otherPaymentTypeSelection">
		<option value='Venmo'>Venmo</option>
		<option value='Google Pay'>Google Pay</option>
		<option value='Paypal'>Paypal</option>
		<option  value='Cash'>Cash</option>
	  </select>`

	}

	togglePaymentHelper(event){
		const isCard=$(event.target).data("card");
		const modal=document.querySelector("#addModalForm")
		

		if(isCard==0){
		
			modal.innerHTML=""
			modal.append(htmlToElement(` <input class="form-control " id="inputAddCardNum" placeholder="Enter Card Number" type="text" pattern=${"\\d*"} maxlength="16" required> `))
			modal.append(htmlToElement(`<input class="form-control" type="text" id="inputAddBank" placeholder="Bank" required>`))
			modal.append(htmlToElement(`<input type="date" class="form-control" id="inputAddDate" placeholder="Expiration Date" required> `))
			$("#paymentMethodToggle").data('card', "1"); 
			console.log("CHANGE TO 1") 

		}else if(isCard==1){

			
			modal.innerHTML=""
			modal.innerHTML=` <select class="form-control" id="addOtherPaymentTypeSelection">
			<option value='Venmo'>Venmo</option>
			<option value='Google Pay'>Google Pay</option>
			<option value='PayPal>Paypal</option>
			<option value='Cash'>Cash</option>
		  </select>`;
			$("#paymentMethodToggle").data('card', "0");
			console.log("CHANGE TO 0")
		}
	}

	updateView(){

		console.log('update view')
		const newList = htmlToElement(' <div id="paymentMethodContainer"></div>');
	
		for (let i = 0; i < rhit.paymentMethodManager.length; i++) {
			const paymentMethod =rhit.paymentMethodManager.getPaymentMethodAtIndex(i);
			const card = this._createCard(paymentMethod);
			newList.appendChild(card);
		}

		const oldList = document.querySelector("#paymentMethodContainer");
		// Put in the new quoteListContainer
		oldList.removeAttribute("id");
		oldList.hidden = true;
		if (newList.innerHTML == "") {
			newList.innerHTML = "<div class='h5'>Oops...The list is empty.</div>";
		}

		oldList.parentElement.appendChild(newList);
		if(this._select){

			$(".selectButton").show();
		}
	}

	
	_createCard(method) {
		
		const elem= htmlToElement(`  
		<div class = "paymentMethod">
			<div class="paymentText">
				<p>Payment Method ID: ${method.PaymentMethodID}</p>
				<p class="paymentType">Payment Type: ${method.Type}	</p>
			</div>
		</div>
		`
		);
		const cardBody=elem.querySelector('.paymentText')
		let date=new Date(method.ExpirationDate)
		
		let updateButton=null
		if(method.Type==='Card'){
			cardBody.append(htmlToElement(`<p class="text-center">Card number ending in: ${method.CardNumber.substring(method.CardNumber.length-4,method.CardNumber.length )}</p>`))
			cardBody.append(htmlToElement(`<p class="text-center">Bank: ${method.Bank}</p>`))
			cardBody.append(htmlToElement(`<p class="text-center">Expiration Date: ${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} </p>`))
			
		}

		updateButton=htmlToElement(`<button data-index=${method.PaymentMethodID} class="btn paymentButton" data-toggle="modal" data-target="#updateModal">Update Payment</button>`)

		updateButton.onclick=(event)=>{
			
			this.currentType=method.Type
			this.oldDate=method.ExpirationDate
			this.currentPaymentID=method.PaymentMethodID
			const modal=document.querySelector("#updateModalForm")
			
			if(method.Type=='Card'){
				
				modal.innerHTML=""
				let inputCardNum=htmlToElement(` <input type="number" class="form-control " id="inputCardNum" placeholder="Enter Card Number" maxlength="16" required> `)
				let inputBank=htmlToElement(`<input class="form-control" type="text" id="inputBank" placeholder="Bank"  required>`)
				let inputDate=htmlToElement(`<input type="date" class="form-control" id="inputDate" placeholder="Expiration Date" required> `)
				inputCardNum.value=method.CardNumber
				inputBank.value=method.Bank
				let date=new Date(method.ExpirationDate)
				let day = ("0" + date.getDate()).slice(-2);
				let month = ("0" + (date.getMonth() + 1)).slice(-2);
				let dateStr = date.getFullYear()+"-"+(month)+"-"+(day)
				inputDate.value=dateStr;
			
				modal.append(inputCardNum)
				modal.append(inputBank)
				modal.append(inputDate)
				$("#paymentMethodToggle").data('card', "0");  
			}else{
				modal.innerHTML=""
				modal.innerHTML=this.selection

			}
		
		}
		
		
		document.querySelector("#updatePayment").onclick=(event)=>{
			let paymentID=this.currentPaymentID
			let cardNum=null
			let bank=null
			let date=null
			let type=null
			
			if(this.currentType!='Card'){
				 type=document.querySelector("#otherPaymentTypeSelection").value
				 $('#updateModal').modal('hide')
			}else{

				let form = document.querySelector('#updateModalForm');
				let isValidForm = form.checkValidity();

				if(isValidForm){
					$('#updateModal').modal('hide')
				}else{
					return
				}
				
				
				 cardNum=document.querySelector("#inputCardNum").value
				 console.log(cardNum)
				bank=document.querySelector("#inputBank").value
				date=document.querySelector("#inputDate").value
				console.log(bank)
				console.log(date)
				if(date==""){
					date=this.oldDate
				}

				
			}
			
			// console.log(date)
			// console.log(bank)
			rhit.paymentMethodManager.updatePaymentMethod(this.updateView.bind(this),paymentID,type,cardNum, bank, date)
		}

		let deleteButton=htmlToElement('<button class="btn paymentButton" data-toggle="modal" data-target="#deleteModal">Delete Payment</button>')
		
		deleteButton.onclick=()=>{

			this.currentPaymentID=method.PaymentMethodID
			console.log(this.currentPaymentID)
		}

		let buttonContainer=htmlToElement('<div class="paymentButtonContainer"></div>')
		// updateButton.onclick=(event)=>{
		// 	this.determineSelection()
		// }	

		let selectButton=htmlToElement(`<button class="btn paymentButton selectButton" >Select Payment</button>`)
		selectButton.onclick = () => {
			sessionStorage.setItem("payment", JSON.stringify(method));
			window.history.back(-1);
		}

		buttonContainer.append(updateButton)
		buttonContainer.append(deleteButton)
		buttonContainer.append(selectButton)
		elem.appendChild(buttonContainer)
		return elem

		
	};

}





rhit.accountPageController = class {
	constructor() {
		const name = rhit.authManager.name;
		const email = rhit.authManager.email;
		const URL = rhit.authManager.photoURL;
		const DOB = rhit.authManager.DOB;


		$("#nameInput").val(name);
		$("#emailInput").val(email);
		$("#urlInput").val(URL);
		$("#DOBInput").val(DOB);
		$(".userImage").attr('src', URL);
		


		$("#submitInfoChange").click(() => {
			const newName = $("#nameInput").val();
			const newEmail = $("#emailInput").val();
			const newURL = $("#urlInput").val();
			const newDOB = $("#DOBInput").val();
			rhit.authManager.changeUserInfo(newName, newEmail,newURL,newDOB);
		})


		// Button Listener
		$("#saveListButton").click(() => {
			window.location.href = "savedList.html";
		});

		$("#myPostButton").click(() => {
			window.location.href = `listPage.html?uid=${rhit.authManager.uid}`;
		});

		//added by Travis
		$("#myOrderButton").click(() => {
			window.location.href = `myOrders.html?uid=${rhit.authManager.uid}`;
		});
		$("#myPaymentButton").click(() => {
			window.location.href = `paymentMethod.html?uid=${rhit.authManager.uid}`;
		});
		$("#myAddressButton").click(() => {
			window.location.href = `Address.html?uid=${rhit.authManager.uid}`;
		});
		//-------------------------

		$("#signOutButton").click(() => {
			rhit.authManager.signOut();
			window.location.href = "loginPage.html";
		});


	}

}


rhit.AddItemController = class {
	constructor(id) {
		this.itemId = id;
		$("#account").click(() => {
			if (!rhit.authManager.isSignedIn) {
				window.location.href = `loginPage.html`
			} else {
				window.location.href = `accountPage.html`
			}
		});
		$("#submitButton").click(() => {
			if (!this.itemId) {
				const url = $("#inputImageUrl").val();
				const item = document.querySelector("#inputItem").value;
				const category = document.querySelector("#inputCat").value;
				const desc = document.querySelector("#inputDes").value;
				const keyword = $("#inputKeyword").val();
				const price = $("#inputPrice").val();

				rhit.fbItemsManager.add(rhit.authManager.uid, item, keyword, category, desc, price, url);

			} else {
				// const url = $("#inputImageUrl").val();
				// const item = document.querySelector("#inputItem").value;
				// const category = document.querySelector("#inputCat").value;
				// const desc = document.querySelector("#inputDes").value;
				// rhit.fbDetailItemManager.update(condition, item, desc, url,category);
			}
		});


	}


	updateView() {
		if (!this.itemId) {
			console.log("No id");
			return;
		}
		console.log(this.itemId);
		var docRef = firebase.firestore().collection("Posts").doc(this.itemId);
		docRef.get().then(function (doc) {
			if (doc.exists) {
				console.log("Document data:", doc.data());
				$("#inputItem").val(doc.data().Name);
				$("#inputImageUrl").val(doc.data().imageUrl);
				$("#inputCat").val(doc.data().imageUrl);
				$("#inputDes").val(doc.data().Description);
				$("#inputCondition").val(doc.data().Condition);
			} else {
				// doc.data() will be undefined in this case
				console.log("No such document!");
			}
		}).catch(function (error) {
			console.log("Error getting document:", error);
		});

		// document.querySelector("#input-item").innerHTML = rhit.fbItemsManager.Name;
		// document.querySelector("#input-cat").innerHTML = rhit.fbItemsManager.Category;
		// document.querySelector("#input-des").innerHTML = rhit.fbItemsManager.Description;
		// document.querySelector("#input-condition").innerHTML = rhit.fbItemsManager.Condition;
	}

}

rhit.LoginPageController = class {
	constructor() {
		$("#loginButton").click(() => {
			//send api request to validate user 
			let username = document.querySelector("#username").value;
			let password = document.querySelector("#password").value;
			if (username != "" && password != "") {
				rhit.authManager.signIn(username, password);
			} else {
				alert("Please fill out the required fields")
			}


		})

		$("#loginback").click(() => {
			if (rhit.authManager.isSignedIn) {
				window.history.back(-1);
			} else {
				window.history.back(-1);

			}
		})
	}
}

rhit.RegisterPageController = class {
	constructor() {
		$("#registerButton").click(() => {
			let username = document.querySelector("#username").value;
			let password = document.querySelector("#password").value;
			let name = document.querySelector("#name").value;
			let dob = document.querySelector("#dob").value;
			let email = document.querySelector("#email").value;
			console.log("CLICKED")
			if (username != "" && password != "" && name != "" && email != "") {
				rhit.authManager.register(name, username, password, email, dob);
			} else {
				alert("Please fill out the required fields")
			}


		})

		$("#signUpback").click(() => {
			
				
				window.history.back(-1);
		})


	}
}

rhit.PurchasePageController = class {

	constructor(id){
		this.id = id;
		this._address = sessionStorage.getItem("address");
		this._payment = sessionStorage.getItem("payment");
		this._itemID = null;
		this._price = null;
		this._shipping = null;
		this._isInPerson = true;


		

		if(!id){
			alert("Item is not available");
		}



		if(this._address){
			let address = JSON.parse(this._address);
			$("#optionsRadios2").prop("checked", true);
			$("#location").hide();
			$("#addressBody").hide();
			this._isInPerson = false;

			$("#addressDetail").html(`<div class = "addressName paymentMethod">
			<div class="aContainer">
				<p>Address ID: ${address.ID}</p>
				<p class="">Street: ${address.Street}	</p>
				<p class="">City: ${address.City}	</p>
				<p class="">Zip: ${address.Zip}	</p>
				<p class="">State: ${address.State}	</p>
				<p class="">Campus Mailbox: ${address.CampusMailBox}	</p>
			</div>
		</div>`)
		$("#addressDetail").show();
		$("#addressDetail").click(() => {
			window.location.href = `./Address.html?select=true`;
		});
		}

		if(this._payment){
			let method = JSON.parse(this._payment);

			$("#paymentBody").hide();

			$("#paymentDetail").html(`<div class = "paymentMethod">
			<div class="paymentText">
				<p>Payment Method ID: ${method.PaymentMethodID}</p>
				<p class="paymentType">Payment Type: ${method.Type}	</p>
			</div>
		</div>`)
		$("#paymentDetail").show();
		$("#paymentDetail").click(() => {
			window.location.href = `./paymentMethod.html?select=true`;
		});
		}

		// if ( $("#optionsRadios1").prop("checked", true)){
		// 	$("addressButton").hide();
		// }else{
		// 	$("addressButton").hide();
		// }
		$("#optionsRadios1").click(() => {
			$("#addressDetail").hide();
			$("#addressBody").hide();
			$("#location").show();
			this._isInPerson = true;
			console.log(this._isInPerson);
		});

		$("#optionsRadios2").click(() => {
			$("#location").hide();
			if(this._address){
				$("#addressDetail").show();
			}else{
				$("#addressBody").show();
			}
			this._isInPerson = false;
			console.log(this._isInPerson);
		});

		$("#addressButton").click(() => {
			window.location.href = `./Address.html?select=true`
		})

		$("#paymentButton").click(() => {
			window.location.href = `./paymentMethod.html?select=true`
		})
		$("#submitPurchase").click(() => {
			if(!this._payment){
				alert("Please add a payment method!");
				return;
			}else if(!this._isInPerson){
				if(!this._address){
					alert("Please add a shipping address!")
					return;
				}
			}else if(!$("#location").val()){
				alert("Please add a in person transaction location!")
				return;
			}
			

			this.submitPurchase();
		})

		rhit.fbDetailItemManager.loadItem(this.updateView.bind(this));
	}

	updateView(){
		$(".img-fluid").attr("src", rhit.fbDetailItemManager.url);
		$("#Name").html(`Item: ${rhit.fbDetailItemManager.Name}`);
		$("#Price").html(`Price: ${rhit.fbDetailItemManager.price}`);
		$("#purchaseContainer").show()
		this._itemID = rhit.fbDetailItemManager.ID;
		this._price = rhit.fbDetailItemManager.price;
		console.log(this._itemID, this._price);
	}

	//Should be in a manager when it grows long.
	submitPurchase(){
		let paymentMethodID = JSON.parse(this._payment).PaymentMethodID;
		let buyerID = rhit.authManager.uid;
		let itemID = this._itemID;
		let location = $("#location").val();
		let addressID = null;
		let price = this._price;
		if (!this._isInPerson){
			location = null;
			addressID = JSON.parse(this._address)
			addressID=addressID.ID
			console.log(addressID+"ID ")
		}
		let r = {"itemID": itemID, "buyerID": buyerID, "paymentMethodID": paymentMethodID,
			"location": location, "price":price, "addressID": addressID}
			

		console.log("___________________________________________________________________")
		console.log(r.itemID, r.buyerID, r.paymentMethodID, r.location, r.price, r.addressID);
		console.log(r.addressID);
		fetch(apiURL + "purchase", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(r)
		}).then(response => response.json()).then((data) => {

			console.log(data);
			alert(data)
			if(data == "Successfully purchased"){
				alert("Congratulations!")
				window.location.href = "listPage.html"
			}
		}).catch((err) => {
			console.log(err);
			// alert("Failed")
			
		});
		
		
		
	}
}


// new modifided from yutong's computer begin
rhit.SavedListController = class{
	constructor(){
		rhit.fbSavedListManager.getSaveList(this.updateView.bind(this))
		$("#account").click(() => {
			if (!rhit.authManager.isSignedIn) {
				window.location.href = `loginPage.html`
			} else {
				window.location.href = `accountPage.html`
			}
		});
	}
	
	updateView(){
		console.log(rhit.fbSavedListManager.data);

		const newList = htmlToElement(' <div id="Container"></div>');
	
		for (let i = 0; i < rhit.fbSavedListManager.length; i++) {
			
			const item = rhit.fbSavedListManager.getItemAtIndex(i);
			// if (regexa && !regexa.test(item.name) && !regexb.test(item.name) && !regexc.test(item.name)) {
			// 	continue;
			// }
			const newItem = this._createItem(item);

			newItem.onclick = (event) => {
				// console.log(`you clicked on ${item.ID}`);
				window.location.href = `./DetailPage.html?id=${item.ItemID}`;
				console.log("you are in the detail page");

			}
			newList.appendChild(newItem);
		}
		const oldList = document.querySelector("#Container");
		// Put in the new quoteListContainer
		oldList.removeAttribute("id");
		oldList.hidden = true;
		if (newList.innerHTML == "") {
			newList.innerHTML = "<div class='h5'>Oops...The list is empty.</div>";
		}
		oldList.parentElement.appendChild(newList);
	}
	_createItem(Post) {
		return htmlToElement(` <div class = "post px-0 my-4">
		<img style = "border-radius: 2em;" src="${Post.photoURL}"alt="${Post.ItemName}">
		<div class="text-center h2 col-7" style="padding-right: 10%;">${Post.ItemName}</div></div>`);
	};
}

rhit.UserOrderController=class{
	constructor(){
		rhit.userOrderManager.getOrders(this.updateList.bind(this))
		this.placeHolderImage="https://user-images.githubusercontent.com/10515204/56117400-9a911800-5f85-11e9-878b-3f998609a6c8.jpg"
	}
	updateList() {
		
		const oldList = document.querySelector("#myOrderContainer");
		// Put in the new quoteListContainer
		oldList.removeAttribute("id");
		oldList.hidden = true;	
		const newList=htmlToElement('<div id="#myOrderContainer"></div>')

		for(let i=0; i<rhit.userOrderManager.length; i++){
			let order=rhit.userOrderManager.getOrderAtIndex(i)
			let orderCard=this._createOrder(order)
			newList.appendChild(orderCard)
		}

		if (newList.innerHTML == "") {
			newList.innerHTML = "<div class='h5'>Oops...The list is empty.</div>";
		}
		oldList.parentElement.appendChild(newList);
	}	


	_createOrder(order) { //Changed
		console.log(this.placeHolderImage)
		let date=new Date(order.PurchaseDate)
		return htmlToElement(` <div class = "px-0 my-4 myOrderCard" style="background-color:#FAEBD7;">
		
			<img class="soldItemImage" style = "border-radius: 2em;  max-width:500px; width: 100%%; height:100%;" src="${order.PhotoURL?order.PhotoURL:this.placeHolderImage}"alt="${order.ItemName}">
		
		<div class="orderDetails">
		<div>
		<p class=" h4 " ">Transaction Details </p>
	
		<p>Item Name: ${order.ItemName}</p>
		<p>Price: $${order.Price}</p>
		<p>Sold By: ${order.SellerName}</p>
		<p>Contact Email: ${order.Email}</p>
		<p>Purchase Date: ${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}</p>
		</div>
		<div>
			<p>Payment: ${order.PaymentType.toLowerCase()=='card'? "Card Ending in "+order.CardNumber.substring(order.CardNumber.length-4, order.CardNumber.length):order.PaymentType}</p>
		</div>
	
		
		</div>
		
		<div style="margin-right:50px; align-items:start; flex-basis:55%;" >
		<p class=" h4 " ">${order.Location.toLowerCase()=='shipping'?"Shipping":"Pickup Location"}</p>
		<p>${order.Location.toLowerCase()=='shipping'?"Shipping to: "+order.Street+" "+order.City+" "+ order.Zip+" "+order.State
			:"Location: " +order.Location} </p>
			<p>${order.Location.toLowerCase()=='shipping'&&order.ShippingMethod?"Shipping Method:"+order.ShippingMethod:order.Location.toLowerCase()=='shipping'?"Seller has not updated shipping yet"
			:""}</p>
			<p>Tracking Number: ${order.Location.toLowerCase()=='shipping'&&order.TrackingNumber?order.TrackingNumber:order.Location.toLowerCase()=='shipping'?"TBA":""}</p>
			<p>Ship Date: ${order.Location.toLowerCase()=='shipping'&&order.TrackingNumber?order.ShipDate.substring(0,10):order.Location.toLowerCase()=='shipping'?"TBA":""}</p>
		</div>
		
			</div>`);
	}

	

}
//*************************************************************************************************** */
// Page Controller Ends
//**************************************************************************************************** */


//*************************************************************************************************** */
// 
//**************************************************************************************************** */




//*************************************************************************************************** */
// 
//**************************************************************************************************** */


//*************************************************************************************************** */
// Managers Begin
//**************************************************************************************************** */



rhit.FbItemsManager = class {
	// constructor(uid, ownerName, itemName, category) {
		// this._uid = uid;
		// this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_POSTS);
		// console.log(this._ref);
		// this._documentSnapshots = [];
		// this._unsubscribe = null;
		// this._ownerName = ownerName;
		// this._itemName = itemName;
		// this._category = category;
	// }

	constructor(uid) {
		this._uid = uid;
		// this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_POSTS);
		// console.log(this._ref);
		this._documentSnapshots = [];
		// this._unsubscribe = null;
		// this._ownerName = ownerName;
		// this._itemName = itemName;
		// this._category = category;
	}

	loadItems(call_back){
		return fetch(apiURL + "items").then(response => response.json()).then((data) => {
			this._documentSnapshots = data.result;
			call_back();
			
		}).catch((err) => {
			console.log(err);
		});
	}

	add(sellerID, name, keyword, type, description, price, photoURL) {
		let data = {"name":name, "sellerID":sellerID,"keyword":keyword, "type": type, "description":description,
		"price":price, "photoURL":photoURL, "sellerID": rhit.authManager.uid};
		console.log("In ItemManager: ", data);
		fetch(apiURL + "item" ,{
			method: "POST",
			headers:{"Content-Type": 'application/json'},
			body:JSON.stringify(data)
	
		}).then(res => res.json()).then((data) => {
			console.log(data);
			window.location.href = `DetailPage.html?id=${data.ID}`;
			
		}).catch((err) => {
			console.log(err);
	
		});
	}
	

	// beginListening(changeListener) {
	// 	let query = this._ref.limit(100);
	// 	if (this._uid) {
	// 		query = query.where(rhit.FB_KEY_OWNER, "==", this._uid);
	// 		rhit.searchWord = this._uid;
	// 	} else if (this._ownerName) {
	// 		query = query.where("Ownername", "==", this._ownerName);
	// 		rhit.searchWord = this._ownerName;
	// 	} else if (this._itemName) {
	// 		// query = query.where(rhit.FB_KEY_NAME, ">=", this._itemName);
	// 		rhit.searchWord = this._itemName;
	// 	} else if (this._category) {
	// 		console.log(this._category);
	// 		this._category = this._category.substr(0,1).toUpperCase() + this._category.substr(1);
	// 		query = query.where("Category", "==", this._category);
	// 		rhit.searchWord = this._category;
	// 	}

	// 	this._unsubscribe = query
	// 		.onSnapshot((querySnapshot) => {
	// 			console.log("Movie Quote update");
	// 			this._documentSnapshots = querySnapshot.docs;
	// 			changeListener();
	// 		});
	// }

	// stopListening() {
	// 	this._unsubscribe();
	// }

	getItemAtIndex(index) {
		const oneitem = this._documentSnapshots[index];
		return oneitem;
	}

	get length() {
		return this._documentSnapshots.length;
	}

}
rhit.AuthManager = class {
	constructor() {
		// this._userInfo = sessionStorage.getItem('user');
		this._user = sessionStorage.getItem('username');
		this._ref = null;
		this._initializePage = null;
	}

	get isSignedIn() { return !!this._user; }
	get email() { return sessionStorage.getItem('Email'); }
	get name() { return sessionStorage.getItem('Name'); }
	get isSignedIn() { return !!this._user; }
	get DOB() {return sessionStorage.getItem('DOB').substring(0,10);}
	get uid() { return sessionStorage.getItem('ID'); }
	get photoURL() { return sessionStorage.getItem('PhotoUrl'); }
	get username() {return this._user;}
	// get phoneNum() { return this._user.phoneNum; }
	// get saveList() { return this.userInfo.saveList; }

	signIn(username, password) {
		let data = { "username": username, "password": password };
		fetch(apiURL + "signIn", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data)
		}).then(response => response.json()).then((data) => {
			if (data.status == true) {
				this._userInfo = data; //Backend return username to frontend, which is unique.
				this._user = data.username;
				console.log(this._user);
				sessionStorage.setItem('username', data.username);
				sessionStorage.setItem('Name', data.Name);
				sessionStorage.setItem('DOB', data.DOB);
				sessionStorage.setItem('Email', data.Email);
				sessionStorage.setItem('PhotoUrl', data.PhotoUrl);
				sessionStorage.setItem('ID', data.ID);

				// rhit.setCookie('user', data, 1); //Save
				// rhit.setCookie('username', data.username, 1)
				alert(`You have logged in successfully as ${this._user}.`)
				window.location = "accountPage.html";
			} else {
				alert("Log in failed.")
			}
		}).catch((err) => {
			console.log(err);
			alert("Log in failed.")
		});

	}

	signOut() {
		//rhit.setCookie('user',1,-1);    //-1表示昨天过期,系统自动删除
		sessionStorage.clear();
	}

	register(name, username, password, email, dob) {
		let data = {
			"name": name, "username": username, "password": password
			, "email": email, "dob": dob
		};
		fetch(apiURL + "register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data)
		}).then(response => response.json()).then((data) => {
			this._user = data.username;
			console.log(this._user);
			// rhit.setCookie('user', this._user, 1); //Save
			alert(`Register ${this._user} successfully. Please login in.`)
			window.location.href = "loginPage.html";
		}).catch((err) => {
			alert(`Register failed.`)
		});
	}

	changeUserInfo(name, email, URL, DOB){
		let data = {
			"name": name, "URL": URL
			,"email": email, "DOB": DOB, "ID": this.uid
		};

		fetch(apiURL + "updateUserInfo", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data)
		}).then(() => {
			
			sessionStorage.setItem('Name',name);
			sessionStorage.setItem('DOB', DOB);
			sessionStorage.setItem('Email', email);
			sessionStorage.setItem('PhotoUrl', URL);
			window.location.reload();
			alert(`Change saved successfully.`)
		}).catch((err) => {
			console.log(err);
			alert(`Failed to save change.`)
		});

	}

}
//new modifided from yutong's computer  begin
rhit.FbSavedListManager = class {
	constructor() {
		this.data=null
		// if(document.querySelector("#"))
	}
	getSaveList(listener){
		console.log("getting save list")
		return fetch(apiURL+'saveList/'+'id/'+ sessionStorage.getItem('ID')).then(response => response.json()).then((data) => {
			this.data=this.data||data

			 console.log(this.data);
		
		}).then(()=>{
			listener();
		})
		.catch((err) => {
		});
	}
	get ItemID(){
		return sessionStorage.getItem('ID');
	}

	getItemAtIndex(index) {
		const oneitem = this.data[index];
		return oneitem;
	}
	get length(){
		return this.data.length;
	}

}
// end
//02/05----------Yutong
rhit.FbSaveItemsManager = class{
	constructor(id) {
		this._id = id
		this.data=null
	}
	saveItem(UserID, itemID){
		console.log("saveItem")
		let data = {
			"UserID":UserID, "itemID":itemID
		};
		fetch(apiURL+"saveItem", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data)
		}).then(response => response.json()).then((data) => {
			console.log(data);
			alert("Item saved");
			window.location.reload();
			// $("#likeIcon").html("favorite");
		})
		.catch((err) => {

		});
	}


	deleteItem(userID, itemID){
		console.log("DELEtE")
		let data = {
			"userID":userID, "itemID":itemID
		};
		fetch(apiURL+"DeleteFromList", {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data)
		}).then(response => response.json()).then((data) => {
			console.log(data);
			alert("Item Deleted");
			window.location.reload();
			// $("#likeIcon").html("favorite_border");
		})
		.catch((err) => {
			console.log("error");
		});
	}
}
// end





rhit.FbDetailItemManager = class { //Changed
	constructor(id) {
		this._id = id;
		this._documentSnapshot = null;
		this._unsubscribe = null;
		// this._ref = firebase.firestore().collection(rhit.FB_COLLECTION_POSTS).doc(id);
		// console.log(`Listening to ${this._ref.path}`);
	}

	// beginListening(changeListener) {
	// 	this._unsubscribe = this._ref.onSnapshot((doc) => {
	// 		if (doc.exists) {
	// 			console.log("Document data:", doc.data());
	// 			this._documentSnapshot = doc;

	// 			changeListener();
	// 		} else {
	// 			console.log("No such document");
	// 		}
	// 	});
	// }
	loadItem(call_back){
		console.log("LOADING ItEM")
		return fetch(apiURL + "item/id/" + this._id).then(response => response.json()).then((data) => {
			this._documentSnapshot = data.result;
			// console.log(this._documentSnapshots);
			call_back();
			
		}).catch((err) => {
			console.log(err);
		});
	}
	update(listener, itemID, sellerID, Name,Keyword, Type, Description, Price){

		console.log(itemID, sellerID)
		let data = {"itemID":itemID,"sellerID": sellerID, "name":Name, "keyword": Keyword, "type":Type, "description":Description,"price":Price};
		console.log(data)
		let header={
			method: "PUT",
			headers:{"Content-Type": 'application/json'},
			body:JSON.stringify(data)
		}

		fetch(apiURL + "UpdateItem/id/"+itemID, header).then((result)=>{
		//	this.getPaymentMethods(listener)
			console.log(result)
			this.loadItem(listener)
		}).catch((err) => {
			console.log(err)
			alert(err)
		});
	
	}
	delete(itemID,sellerID, callback) {
		console.log(sellerID);
		let data = {
		   "itemID":itemID, "sellerID": sellerID
		};
		console.log(data);
		fetch(apiURL+"deleteItem", {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data)
		}).then(response => response.json()).then((data) => {
			console.log(data);
			callback();
		})
		.catch((err) => {
			console.log("error");
		});
	}


	// update(Condition, Name, Description, url) {
	// 	this._ref.update({
	// 		// [rhit.FB_KEY_CATEGORY]: Type,
	// 		[rhit.FB_KEY_NAME]: Name,
	// 		[rhit.FB_KEY_CONDITION]: Condition,
	// 		[rhit.FB_KEY_DESCRIPTION]: Description,
	// 		[rhit.FB_KEY_IMAGE_URL]: url,
	// 		[rhit.FB_KEY_LAST_TOUCHED]: firebase.firestore.Timestamp.now(),
	// 	})
	// 		.then(() => {
	// 			console.log("Document successfully updated!");
	// 			alert("Update Successfully");
	// 		})
	// 		.catch(function (error) {
	// 			console.error("Error writing document: ", error);
	// 		});

	// }

	get ID(){
		return this._id;
	}


	get url() {

		return this._documentSnapshot.photoURL;
	}

	get Owner() {
		// console.log(this._documentSnapshot.SellerUsername);
		return this._documentSnapshot.SellerUsername;
	}

	get Name() {

		return this._documentSnapshot.ItemName;
	}

	get Status() {
		return this._documentSnapshot.Status;
	}

	get Email(){
		return this._documentSnapshot.SellerEmail;
	}

	get Description() {
		return this._documentSnapshot["Item's description"];
	}

	get Ownername() {
		return this._documentSnapshot.SellerName;
	}

	get price(){
		return this._documentSnapshot.Price
	}

	get Type(){
		console.log(this._documentSnapshot.ItemType);
		return this._documentSnapshot.ItemType
	}

	get keyword(){
	
		return this._documentSnapshot["Item's keyword"]
	}

	get SellerID(){
		return this._documentSnapshot.SellerID
	}
}


rhit.PaymentMethodManager=class{
	constructor(){
		this.data=[]
		
	}

	getPaymentMethods(listener){
		
		return fetch(apiURL + "MyPaymentMethod/id/"+rhit.authManager.uid).then(response => response.json()).then((data) => {
			this.data = data
			console.log(this.data)
			listener()
		
		}).catch((err) => {
			console.log(err);
		});
	}

	updatePaymentMethod(listener, paymentMethodID,type ,cardNum, bank,expDate){
		let data = {"paymentMethodID":paymentMethodID,"type":type, "cardNum":cardNum,"bank":bank,"expDate":expDate};
		console.log(paymentMethodID)
		let header={
			method: "PUT",
			headers:{"Content-Type": 'application/json'},
			body:JSON.stringify(data)
		}

		fetch(apiURL + "UpdatePaymentMethod/id/"+rhit.authManager.uid,header).then((result)=>{
			this.getPaymentMethods(listener)
			console.log(result)
		}).catch((err) => {
			console.log(err)
			alert(err)
		});
	}

	addPaymentMethod(listener, type, cardNum, bank, expDate){
	
		let data = {"userID":rhit.authManager.uid,"type":type, "cardNum":cardNum,"bank":bank,"expDate":expDate};
		let header={
			method: "POST",
			headers:{"Content-Type": 'application/json'},
			body:JSON.stringify(data)
		}


		fetch(apiURL + "AddPaymentMethod",header).then((result)=>{
			if(result.ok==false){
				result.text().then((text)=>{
					alert(JSON.parse(text).originalError.info.message)
				})
				
			}else{
				this.getPaymentMethods(listener)
			}	
		}).catch((err) => {
		
			alert(err.message)
		});
	}

	deletePayment(paymentMethodID, listener){
		let data = {"userID":rhit.authManager.uid,"paymentID":paymentMethodID};

		let header={
			method: "DELETE",
			headers:{"Content-Type": 'application/json'},
			body:JSON.stringify(data)
		}

		fetch(apiURL + "DeletePaymentMethod", header).then((result)=>{
			if(result.ok==false){
				result.text().then((text)=>{
					alert(JSON.parse(text).originalError.info.message)
				})
			}else{
				this.getPaymentMethods(listener)
			}	
		}).catch((err) => {
		
			alert(err.message)
		});
	}
	
	get length(){
		return this.data.length
	}

	getPaymentMethodAtIndex(index){
		return this.data[index]
	}

}



rhit.AddressManager=class{
	constructor(){
		this.data=null
	}

	
	getAddress(listener){
		
		return fetch(apiURL + "MyAddress/id/"+rhit.authManager.uid).then(response => response.json()).then((data) => {
			this.data = data
			console.log(this.data)
			console.log(this.data)
			listener()
		
		}).catch((err) => {
			console.log(err);
		});
	}

	updateAddress(listener, addressID , street ,city, state,zip, campusMailBox){
		let data = {"addressID":addressID,"street":street, "city":city,"state":state,"zip":zip, "campusMailBox":campusMailBox};
		console.log(state)
		let header={
			method: "PUT",
			headers:{"Content-Type": 'application/json'},
			body:JSON.stringify(data)
		}

		fetch(apiURL + "UpdateAddress/id/"+rhit.authManager.uid,header).then((result)=>{
			this.getAddress(listener)
			console.log(result)
		}).catch((err) => {
			console.log(err)
			
		});
	}

	addAddress(listener,street ,city, state,zip, campusMailBox){
		console.log("fsfaaf")
		let data = {"userID":rhit.authManager.uid, "street":street, "city":city,"state":state,"zip":zip, "campusMailBox":campusMailBox};
		let header={
			method: "POST",
			headers:{"Content-Type": 'application/json'},
			body:JSON.stringify(data)
		}


		fetch(apiURL + "AddAddress",header).then((result)=>{
			if(result.ok==false){
				result.text().then((text)=>{
					alert(JSON.parse(text).originalError.info.message)
				})
			}else{
				this.getAddress(listener)
			}	
		}).catch((err) => {
			console(err.message)
		});
	}

	deleteAddress(addressID, listener){
		let data = {"userID":rhit.authManager.uid,"addressID":addressID};

		let header={
			method: "DELETE",
			headers:{"Content-Type": 'application/json'},
			body:JSON.stringify(data)
		}

		fetch(apiURL + "DeleteAddress", header).then((result)=>{
			if(result.ok==false){
				result.text().then((text)=>{
					alert(JSON.parse(text).originalError.info.message)
				})
			}else{
				this.getAddress(listener)
			}	
		}).catch((err) => {
		
			alert(err.message)
		});
	}
	
	get length(){
		return this.data.length
	}

	getAddressAtIndex(index){
		return this.data[index]
	}
}


rhit.UserOrderManager=class{
	constructor(){
		this.data=null;
		
	}

	getOrders(listener){
		return fetch(apiURL + "myOrders/id/"+rhit.authManager.uid).then(response => response.json()).then((data) => {
			this.data = data
			console.log(this.data)
			listener()
		
		}).catch((err) => {
			console.log(err);
		});
	}

	get length(){
		return this.data.length
	}

	getOrderAtIndex(i){
		return this.data[i]
	}
	
}






rhit.SellTransactionManager = class{

	constructor(itemID){
		this.itemID = itemID;
	}

	loadTransaction(callback){
		fetch(apiURL + "getsellTransaction/itemID/" + this.itemID).then(res => res.json()).then((data) => {
			console.log(data);
			this.buyerEmail = data["Buyer Email"];
			this.buyerName = data["Buyer Name"];
			console.log(this.buyerName);
			this.CM = data.CampusMailbox;
			this.city = data.City;
			this.location = data.Location;
			this.price = data.Price;
			this.pTime = data.PurchaseTime;
			this.shippingMethod = data.ShippingMethod;
			this.state = data.State;
			this.street = data.Street;
			this.trackNum = data.TrackingNumber;
			this.zip = data.Zip;
			this.transactionID = data.TransactionID;
			callback();
		}).catch(err => console.log(err))
	}

	updateShipment(trackNum, shippingMethod){
		let data = {"trackNum": trackNum, "shippingMethod": shippingMethod, "transactionID":this.transactionID};
		fetch(apiURL + "updateShipment",{
			method: "PUT",
			headers:{"Content-Type": 'application/json'},
			body:JSON.stringify(data)
		}).then(res => res.json()).then((data) => {
			alert(data);
			window.location.reload();
		})

	}
}




// Objects begins
// rhit.User = class {
// 	constructor(uid, saveList) {
// 		this.uid = uid;
// 		this.saveList = saveList;
// 	}

// 	addToSaveList(id) {
// 		this.saveList.push(id);
// 	}

// 	deleteFromSaveList(id) {
// 		let index = this.saveList.indexOf(id);
// 		if (index != -1) {
// 			this.saveList.splice(index, 1);
// 		} else {
// 			console.log("No such element in saved list");
// 		}
// 	}
// }


// rhit.Post = class {
// 	constructor(id, name, url) {
// 		this.id = id;
// 		this.name = name;
// 		this.url = url;
// 	}
// }
// //Objects end

// //Functions begins

// From https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro/35385518#35385518
function htmlToElement(html) {
	var template = document.createElement('template');
	html = html.trim();
	template.innerHTML = html;
	return template.content.firstChild;
}

rhit.initializePage = () => {
	const urlParams = new URLSearchParams(window.location.search);
	const id = urlParams.get("id");
	const uid = urlParams.get("uid");
	// const ownerName = urlParams.get("ownername");
	const itemName = urlParams.get("name");
	const select =urlParams.get("select")
	const isEdit=urlParams.get("edit");
	// const category = urlParams.get("category");
	// console.log(urlParams.getAll());



	if (document.querySelector("#loginPage")) {
		new rhit.LoginPageController();
	}

	if (document.querySelector("#mainPage")) {
		new rhit.HomePageController();
	}

	if (document.querySelector("#ListPage")) {
		console.log("You are on the List page");
		// rhit.fbItemsManager = new rhit.FbItemsManager(uid, ownerName, itemName, category);
		rhit.fbItemsManager = new rhit.FbItemsManager(uid);
		new rhit.ListPageController(uid, itemName);
	}

	if (document.querySelector("#detailPage")) {
		console.log("detail Page");
		rhit.fbDetailItemManager = new rhit.FbDetailItemManager(id);
		rhit.fbSaveItemsManager = new rhit.FbSaveItemsManager();
		new rhit.DetailPageController(id);

	}

	if (document.querySelector("#accountPage")) {
		new rhit.accountPageController();

	}

	if(document.querySelector("#paymentMethodPage")){
		rhit.paymentMethodManager=new rhit.PaymentMethodManager();
		rhit.paymentMethodController=new rhit.PaymentMethodController(select);
	}

	// if (document.querySelector("#savedListPage")) {
	// 	console.log("You are on the saveList page");
	// 	rhit.fbItemsManager = new rhit.FbItemsManager();
	// 	new rhit.SavedListController();
	// }

	if (document.querySelector("#categoryPage")) {
		new rhit.CategoryPageController();
	}

	if (document.querySelector("#addItem")) {

		rhit.fbItemsManager = new rhit.FbItemsManager(uid);
		rhit.fbDetailItemManager=new rhit.FbDetailItemManager(id);
		
		if(!isEdit){
			rhit.addItemController = new rhit.AddItemController(id)
		}else if(isEdit){
			//should be in a controller but i am too lazy
			
			let itemInfo=JSON.parse(sessionStorage.getItem("Item"))

			const url = document.querySelector("#inputImageUrl")
				const item = document.querySelector("#inputItem");
				// const category = document.querySelector("#inputCat").value;
				const desc = document.querySelector("#inputDes");
				const keyword = document.querySelector("#inputKeyword");
				const price = document.querySelector("#inputPrice");
				const Type = document.querySelector("#inputCat");
				console.log(itemInfo)
				url.value=itemInfo.URL
				item.value=itemInfo.Name
				desc.value=itemInfo.Desc
				keyword.value=itemInfo.Keyword
				price.value=itemInfo.Price
				Type.value=itemInfo.Type
				console.log("OCOOOO")
			document.querySelector("#submitButton").onclick=()=>{
				rhit.fbDetailItemManager.update(
					()=>{
						window.href=`DetailPage.html?id=${itemInfo.ID}`
					}, itemInfo.ID, itemInfo.Owner,
					item.value, keyword.value, Type.value, desc.value, price.value)
			}
			


		}
		
		// rhit.addItemController.updateView();
		
		// if (id) {
		// 	rhit.fbDetailItemManager = new rhit.FbDetailItemManager(id);
		// }
	}

	if(document.querySelector("#purchasePage")){

		rhit.fbDetailItemManager = new rhit.FbDetailItemManager(id);
		new rhit.PurchasePageController(id);
		// new rhit.DetailPageController(id);
	}

	if (document.querySelector("#registerPage")) {
		rhit.registerPageController = new rhit.RegisterPageController()
	}

	if(document.querySelector("#addressPage")){
		rhit.addressManager=new rhit.AddressManager()
		rhit.AddressController=new rhit.AddressController(select)
	}




	// if(document.querySelector("#detailPage")){


	// 	if (!photoId){
	// 		window.location.href = "/";
	// 	}

	// 	rhit.singlePhotoManager = new rhit.SinglePhotoManager(photoId);
	// 	new rhit.DetailPageController();
	// }
	if(document.querySelector("#myOrderPage")){
		rhit.userOrderManager=new rhit.UserOrderManager();
		rhit.userOrderController=new rhit.UserOrderController();
	}


	console.log("Current user: ", rhit.authManager._user);



// new modifided from Yutong's computer 	
	if(document.querySelector("#savedListPage")){
	
		rhit.savedListController=new rhit.SavedListController();
	}

	if(document.querySelector("#sellTransactionPage")){
		rhit.sellTransactionManager = new rhit.SellTransactionManager(id);
		rhit.fbDetailItemManager = new rhit.FbDetailItemManager(id);
		new rhit.SellTransactionPageController();
	}

};









// end

rhit.checkForRedirects = () => {
	if (document.querySelector("#loginPage") && rhit.authManager.isSignedIn) {
		window.location.href = "javascript:history.back(-1)";
		console.log(rhit.authManager._user);
	}

	if (!document.querySelector("#loginPage") && !document.querySelector("#mainPage") && !document.querySelector("#ListPage")
		&& !document.querySelector("#detailPage") && !document.querySelector("#registerPage") && !rhit.authManager.isSignedIn) {
		window.location.href = "/static";
	}
}
// //Functions end






/* Main */
/** function and class syntax examples */
rhit.main = function () {
	// console.log("Ready");
	// rhit.usersManager = new rhit.UsersManager();
	// rhit.usersManager.beginListening(() => { });
	rhit.fbSavedListManager= new rhit.FbSavedListManager();
	rhit.authManager = new rhit.AuthManager();
	// rhit.authManager.signOut();
	// rhit.authManager.beginListening(() => {
		rhit.checkForRedirects();
	rhit.initializePage();
	// });







};



rhit.main();