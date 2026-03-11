import dot from 'dotenv'
dot.config()
import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL = process.env.URL
const SUPABASE_KEY = process.env.KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const dishAngle = async (req, res) => {
  const id = req.params["dishId"]
  const sign = req.params["sign"]
  const {error, data} = await supabase.from('dish').select('*').eq('dish_id',id)
  if (error != null){
    console.log('Unable to fetch Dish Data')
  }
  var dish_angle = data[0]['elevation_angle']
  if (sign == "+"){
    dish_angle = dish_angle + 5
  }
  else if (sign == "-"){
    dish_angle = dish_angle - 5
  }
  else{
    console.log('Wrong Sign')
  }
  const {error2} = await supabase.from('dish').update({elevation_angle: dish_angle}).eq('dish_id', id)
  if (error2 != null){
    console.log('Unable to update Dish Data')
  }
  res.send(dish_angle)
}

const dishTransmission = async (req, res) => {
  const id = req.params["dishId"]
  const {error, data} = await supabase.from('dish').select('*').eq('dish_id',id)
  if (error != null){
    console.log('Unable to fetch Dish Data')
    t
  }
  var dish_transmission = data[0]['is_transmitting']
  if (dish_transmission == true){
    dish_transmission = false
  }
  else{
    dish_transmission = true
  }
  const {error2} = await supabase.from('dish').update({is_transmitting: dish_transmission}).eq('dish_id', id)
  if (error2 != null){
    console.log('Unable to update Dish Data')
  }
  res.send(dish_transmission)
}

export default {dishAngle, dishTransmission}