const {firestore,admin}= require("../firebase-database/firebase-connector")
const createAdminAccount = (req,res)=>{
    
    // creating account

    // let defaultProfile = "https://firebasestorage.googleapis.com/v0/b/discussion-manager.appspot.com/o/profileDeafultImages%2Fdefault_image.png?alt=media&token=432b7002-1168-4678-8339-eca37d06d25a"   
    // admin
    // .auth()
    // .createUser({
    // // //   email: req.body.email,
    // // //   phoneNumber: req.body.phoneNumber,
    // // //   password: req.body.password,
    // // //   emailVerified: false,
    // // //   displayName: req.body.displayName,
    // // //   address:req.body.address,
    // // //   onlineStatus:req.body.onlineStatus,
    // // //   photoUrl:defaultProfile,
    // // //   disabled: false,
    //   email: "zeeshanahmedd0010@gmail.com",
    //   phoneNumber:"+923053206339",
    //   password: "123456",
    //   emailVerified: false,
    //   displayName:"Zeeshan",
    //   address:"sometext",
    //   onlineStatus:"",
    //   photoUrl:defaultProfile,
    //   disabled: false,
    // })

    // .then((userRecord) => {
    //     console.log(userRecord)
    //     res.send({responseMessage:"This is method for creating admin account"});
    // }) 

    // firestore.collection("users").add({
    //     first: "Tuba",
    //     last: "Asif",
    //     born: 1815
    // })
    // .then((docRef) => {
    //     console.log("Document written with ID: ", docRef.id);
    //     res.send({responseMessage:`Docuemnt written with ID : ${docRef.id}`}); 
    // })
    // .catch((error) => {
        
    //     console.error("Error adding document: ", error);
    //     res.send({responseMessage:"This is method for creating admin account"}); 
    // });

    res.send({responseMessage:"This is method for creating admin account"}); 
}

module.exports = {createAdminAccount}