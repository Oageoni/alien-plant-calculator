// Function to fetch and process data from 'data.json'
async function fetchData() {
  try {
    const response = await fetch('data.json')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

// Function to fetch and process constants from 'constants.json'
async function fetchConstants() {
  try {
    const response = await fetch('constants.json')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

//Function to fetch constants and populate pot type dropdown menu
function populatePottype(data) {
  if (!data) return
  const dropdown = document.getElementById('potType')
  for (let i = 0; i < data.length; i++) {
    if (data[i].datatype === 'pot') {
      const option = document.createElement('option')
      option.text = data[i].name
      option.value = data[i].name
      dropdown.add(option)
    }
  }
}

//Function to fetch constants and populate plant type dropdown menu
function populatePlantType(data) {
  if (!data) return
  const dropdown = document.getElementById('plantType')
  for (let i = 0; i < data.length; i++) {
    if (data[i].datatype === 'species') {
      const option = document.createElement('option')
      option.text = data[i].name
      option.value = data[i].name
      dropdown.add(option)
    }
  }
}

//Function to fetch constants and populate season dropdown menu
function populateSeason(data) {
  if (!data) return
  const dropdown = document.getElementById('season')
  for (let i = 0; i < data.length; i++) {
    if (data[i].datatype === 'season') {
      const option = document.createElement('option')
      option.text = data[i].name
      option.value = data[i].name
      dropdown.add(option)
    }
  }
}

async function initialize() {
  const constants = await fetchConstants()
  populatePottype(constants)
  populatePlantType(constants)
  populateSeason(constants)
}
function calculatePotVolume(diameter, height) {
  const radius = diameter / 2
  return Math.PI * Math.pow(radius, 2) * height
}

//Function to calculate water and fertilizer recommendations
async function calculateRecommendations(potVolume, potType, plantType, season) {
  const data = await fetchConstants()
  if (!data) return
  let potdata
  let speciesdata
  let seasondata

  for (let i = 0; i < data.length; i++) {
    if (data[i].datatype === 'pot' && data[i].name === potType) {
      potdata = data[i]
    } else if (data[i].datatype === 'species' && data[i].name === plantType) {
      speciesdata = data[i]
    } else if (data[i].datatype === 'season' && data[i].name === season) {
      seasondata = data[i]
    }
  }

  let water = potVolume * 0.0001 * potdata.datafield_1 * seasondata.datafield_1
  let fertilizer = water * seasondata.datafield_2

  document.getElementById('recommendedWater').textContent = `${water.toFixed(
    1
  )} liters`
  document.getElementById(
    'recommendedFertilizer'
  ).textContent = `${fertilizer.toFixed(2)} units`
}

// Function to search recommendations data and calculate statistics based on it and user inputs
async function findRecommendations(potVolume, potType, plantType, season) {
  const data = await fetchData()
  if (!data) return

  let similarCount = 0
  let lesswaterCount = 0
  let lesswaterGrowthSum = 0
  let lesswaterYieldSum = 0
  let morewaterCount = 0
  let morewaterGrowthSum = 0
  let morewaterYieldSum = 0
  let similarwaterCount = 0
  let similarwaterGrowthSum = 0
  let similarwaterYieldSum = 0
  for (let i = 0; i < data.length; i++) {
    const currPotType = data[i].pot_type
    const currPlantType = data[i].plant_type
    const currTimeOfYear = data[i].time_of_year
    const currPotVolume = data[i].pot_volume
    const currActualWater = data[i].actual_water
    const currRecommentedWater = data[i].recommented_water
    const currGrowthRate = data[i].growth_rate
    const currCropYield = data[i].crop_yield
    if (
      currPotType === potType &&
      currPlantType === plantType &&
      currTimeOfYear === season &&
      currPotVolume > potVolume * 0.9 &&
      currPotVolume > potVolume * 1.1
    ) {
      similarCount = similarCount + 1

      if (
        currActualWater > currRecommentedWater * 0.9 &&
        currActualWater > currRecommentedWater * 1.1
      ) {
        similarwaterCount = similarwaterCount + 1
        similarwaterGrowthSum = similarwaterGrowthSum + currGrowthRate
        similarwaterYieldSum = similarwaterYieldSum + currCropYield
      }
      if (currActualWater <= currRecommentedWater * 0.9) {
        lesswaterCount = lesswaterCount + 1
        lesswaterGrowthSum = lesswaterGrowthSum + currGrowthRate
        lesswaterYieldSum = lesswaterYieldSum + currCropYield
      }
      if (currActualWater >= currRecommentedWater * 1.1) {
        morewaterCount = morewaterCount + 1
        morewaterGrowthSum = morewaterGrowthSum + currGrowthRate
        morewaterYieldSum = morewaterYieldSum + currCropYield
      }
    }
  }
  document.getElementById('similar').textContent = similarCount

  document.getElementById('similarwaterCount').textContent = similarwaterCount
  document.getElementById('similarwaterGrowthAverage').textContent =
    similarwaterCount
      ? (similarwaterGrowthSum / similarwaterCount).toFixed(1)
      : '-'
  document.getElementById('similarwaterYieldAverage').textContent =
    similarwaterCount
      ? (similarwaterYieldSum / similarwaterCount).toFixed(1)
      : '-'

  document.getElementById('lesswaterCount').textContent = lesswaterCount
  document.getElementById('lesswaterGrowthAverage').textContent = lesswaterCount
    ? (lesswaterGrowthSum / lesswaterCount).toFixed(1)
    : '-'
  document.getElementById('lesswaterYieldAverage').textContent = lesswaterCount
    ? (lesswaterYieldSum / lesswaterCount).toFixed(1)
    : '-'

  document.getElementById('morewaterCount').textContent = morewaterCount
  document.getElementById('morewaterGrowthAverage').textContent = morewaterCount
    ? (morewaterGrowthSum / morewaterCount).toFixed(1)
    : '-'
  document.getElementById('morewaterYieldAverage').textContent = morewaterCount
    ? (morewaterYieldSum / morewaterCount).toFixed(1)
    : '-'

  let outputSection = document.getElementById('outputSection')
  outputSection.style.display = 'block'
}

// Event listener for the calculate button
document
  .getElementById('calculateButton')
  .addEventListener('click', function () {
    const potType = document.getElementById('potType').value
    const potDiameter = parseFloat(document.getElementById('potDiameter').value)
    const potHeight = parseFloat(document.getElementById('potHeight').value)
    const plantType = document.getElementById('plantType').value
    const season = document.getElementById('season').value

    // Calculate pot volume (if needed in your logic)
    const potVolume = calculatePotVolume(potDiameter, potHeight)
    document.getElementById('potSize').textContent = (potVolume / 1000).toFixed(
      1
    )

    calculateRecommendations(potVolume, potType, plantType, season)

    // Find and display recommendations and statistics
    findRecommendations(potVolume, potType, plantType, season)
  })
