// let apiKey="a26c79c4eadfa4c1668afff4398d56f1";
// let city="kodaikanal";

// async function fetchData()
// {
//     const url=`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
//     try{
//  const response=await fetch(url);
//     if(!response.ok)
//     {
//         throw("not fetching any data");
//     }
//     const data= await response.json();
//     console.log(data);
//     console.log(`the temperature of ${city} is ${data.main.temp} `)
//     } 
    
//     catch(err)
//     {
// console.log(err.message);
//     }
// }
// fetchData(city);