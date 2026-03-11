import express from 'express';
import functions from './function.js';

const app = express()
const port = 3000
console.log(`First: ${functions['0']}  Second: ${functions['1']}`)
app.get('/Dish/Angle/:sign/:dishId', functions.dishAngle)
app.get('/Dish/Transmission/:dishId', functions.dishTransmission)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

app.use(express.static('public'))