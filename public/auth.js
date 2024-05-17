document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".container");
    const signUp = document.querySelector(".signup-link");
    const login = document.querySelector(".login-link");

    signUp.addEventListener("click", () => {
        container.classList.add("active");
    });

    login.addEventListener("click", () => {
        container.classList.remove("active");
    });

    // Регистрация
    document.querySelector('.form.signup form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const username = event.target.querySelector('input[placeholder="Логин"]').value;
        const email = event.target.querySelector('input[placeholder="Электронная почта"]').value;
        const password = event.target.querySelector('input[placeholder="Пароль"]').value;

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                container.classList.remove("active");
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('Ошибка при регистрации');
        }
    });

    // Авторизация
    document.querySelector('.form.login form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = event.target.querySelector('input[placeholder="Электронная почта"]').value;
        const password = event.target.querySelector('input[placeholder="Пароль"]').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message);
                localStorage.setItem('userId', result.userId);
                window.location.href = 'sudoku.html';
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Ошибка при авторизации');
        }
    });
});
