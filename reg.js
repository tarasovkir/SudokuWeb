const container = document.querySelector(".container");
const signUp = document.querySelector(".signup-link");
const login = document.querySelector(".login-link");

signUp.addEventListener("click", ( )=>{
    container.classList.add("active");
});
login.addEventListener("click", ( )=>{
    container.classList.remove("active");
});