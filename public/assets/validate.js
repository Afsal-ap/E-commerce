const form = document.getElementById("form")
const nameInput = document.getElementById("name")
const emailInput = document.getElementById("email")
const numberInput = document.getElementById("number")
const passwordInput = document.getElementById("password1")
const password2Input = document.getElementById("password2")

form.addEventListener("submit",(e)=>{
    e.preventDefault();
    document.getElementById("errorName").innerText = "";
    document.getElementById("errorEmail").innerText = "";
    document.getElementById("errorNumber").innerText = "";
    document.getElementById("errorPassword").innerText ="";
    document.getElementById("errorConfirmPassword").innerText="";
   const verified = validateInputs();
   if(verified===false)return;
   form.submit();
})
function validateInputs(){
    let isValid = true

    // name validation
    var regex = /^[A-Za-z]+$/;
    const name = nameInput.value
    if(name.trim()===""){
     document.getElementById("errorName").innerText = "Name is required"
     isValid = false
    } else if (!regex.test(nameInput.value.trim())) {
      errorName.innerHTML = "Name should only contain alphabetical characters";
      return false;
    }
    //Email validation
    const email  = emailInput.value
    if(email.trim() ===""){
        document.getElementById("errorEmail").innerText = "Email is required"
    isValid = false
     }else if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)){
        document.getElementById("errorEmail").innerText = "provide a valid email";
        isValid =false
     }
     //Number validation
     const number = numberInput.value
     if(number.trim()===""){
        document.getElementById("errorNumber").innerText = "Number is required"
        isValid = false
        // number length check
   } if(number.length<10){
   document.getElementById("errorNumber").innerText = "Number is too short"
   isValid = false}
    //password validation
       const password = passwordInput.value
    if(password.trim()===""){
    document.getElementById("errorPassword").innerText = "password is required"
    isValid = false
    }
    //confirm password validation
     const password2 = password2Input.value
     if(password2.trim()===""){
     document. getElementById("errorConfirmPassword").innerText  =  "  confirm password is required"
      isValid  = false
     }else if(password !==password2){
     document.getElementById("errorConfirmPassword").innerText ="Password do not match"
    isValid = false
    }
    return isValid
}


