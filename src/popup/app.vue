<script setup lang="ts">
import { getSchedule } from './parseSchedule'
</script>

<template>
  <div class="form">
    <h2>Period:</h2>
    <div class="period-buttons">
      <!-- <button class="period-button">week</button>
      <button class="period-button">2 weeks</button>
      <button class="period-button">month</button> -->
      <input
        type="radio"
        id="week"
        name="period-group"
        class="period-button"
        checked
      />
      <label for="week">week</label>

      <input
        type="radio"
        id="2weeks"
        name="period-group"
        class="period-button"
      />
      <label for="2weeks">2 weeks</label>
      <input
        type="radio"
        id="month"
        name="period-group"
        class="period-button"
      />
      <label for="month">month</label>
      <input
        type="radio"
        id="manual"
        name="period-group"
        class="period-button"
      />
      <label for="manual">manual</label>
    </div>
    <div class="date-inputs">
      <h2>From:</h2>
      <input
        type="date"
        class="date-input"
      />
      <h2>To:</h2>
      <input
        type="date"
        class="date-input"
      />
    </div>
    <div>
      <button
        class="export-button"
        @click="getSchedule"
      >
        Export
      </button>
    </div>
  </div>
</template>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
}
.period-buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

/* Hide the radio buttons */
.period-button {
  display: none;
}

/* Default button style */
.period-button + label {
  font-size: 0.8rem;
  font-weight: 600;
  background-color: #fff;
  border: 1.5px solid #000;
  border-radius: 5px;
  padding: 5px;
}

/* Style for the active button */
.period-button:checked + label {
  background-color: #000000; /* Change this to your desired active color */
  color: white; /* Change text color if needed */
}

.date-inputs {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.date-input {
  font-size: 0.8rem;
  font-weight: 600;
  background-color: #fff;
  border: 1.5px solid #000;
  border-radius: 5px;
  padding: 5px;
  width: 100%;
}

button {
  font-size: 0.8rem;
  font-weight: 600;
  background-color: #fff;
  border: 1.5px solid #000;
  border-radius: 5px;
  padding: 5px;
  width: 100%;
}

.export-button {
  margin-top: 10px;
  background-color: #000;
  color: #fff;
  width: 100%;
}

h2 {
  font-size: 1.3rem;
  font-weight: 400;
  margin: 0;
}
</style>
