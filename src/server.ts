import app from "./app"

// using 5000 because frontend is usually 3000
const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Servidor inicializado em http://localhost:${PORT}`))