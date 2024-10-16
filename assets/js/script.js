/* 
Project Name: Imaginator - AI Image Generator
Author: Youssef Lizdihar
Email: Youssefyd.3d@gmail.com

Description:
Imaginator is an AI-based image generation tool that converts text prompts into high-quality images within seconds. 
Utilizing the OpenAI API, this project allows users to input descriptive text and receive visual representations generated 
by advanced AI algorithms. Users can download or edit the images using a built-in editor. The tool is designed to facilitate 
creativity and provide quick visual content for various uses. 

Features:
1. Generate images from text prompts using AI.
2. Select the number of images to generate.
3. Download generated images in high resolution.
4. Edit images using filters and transformations.
5. Frequently Asked Questions (FAQ) section for user guidance.

Note:
This project was created for educational purposes during the ALx Software Engineering Program.
*/


// Select the form and buttons from the DOM
const generateForm = document.querySelector(".generate-form");
const generateBtn = generateForm.querySelector(".generate-btn");
const imageGallery = document.querySelector(".image-gallery");

const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE"; // Your OpenAI API key here inside ""
let isImageGenerating = false;

// Update image card with generated images
const updateImageCard = (imgDataArray) => {
  imgDataArray.forEach((imgObject, index) => {
    const imgCard = imageGallery.querySelectorAll(".img-card")[index];
    const imgElement = imgCard.querySelector("img");
    const downloadBtn = imgCard.querySelector(".download-btn");
    const editButton = imgCard.querySelector(".edit-btn");
    const editorBody = document.querySelector('.editor-body');
    let contentAdded = false;

    // Convert image data to base64 and set the image source
    const aiGeneratedImage = `data:image/jpeg;base64,${imgObject.b64_json}`;
    imgElement.src = aiGeneratedImage;

    // When image is loaded, update the download button and add event listener for edit
    imgElement.onload = () => {
      imgCard.classList.remove("loading");
      downloadBtn.setAttribute("href", aiGeneratedImage);
      downloadBtn.setAttribute("download", `${new Date().getTime()}-imaginator.jpg`);

      editButton.addEventListener('click', function() {
        if (!contentAdded) {
          const container = document.createElement('div');
          container.classList.add('container');
          container.innerHTML = `
            <h2>Easy Image Editor</h2>
            <div class="wrapper">
              <div class="editor-panel">
                <div class="filter">
                  <label class="title">Filters</label>
                  <div class="options">
                    <button id="brightness" class="active">Brightness</button>
                    <button id="saturation">Saturation</button>
                    <button id="inversion">Inversion</button>
                    <button id="grayscale">Grayscale</button>
                  </div>
                  <div class="slider">
                    <div class="filter-info">
                      <p class="name">Brightness</p>
                      <p class="value">100%</p>
                    </div>
                    <input type="range" value="100" min="0" max="200">
                  </div>
                </div>
                <div class="rotate">
                  <label class="title">Rotate & Flip</label>
                  <div class="options">
                    <button id="left"><i class="fa-solid fa-rotate-left"></i></button>
                    <button id="right"><i class="fa-solid fa-rotate-right"></i></button>
                    <button id="horizontal"><i class='bx bx-reflect-vertical'></i></button>
                    <button id="vertical"><i class='bx bx-reflect-horizontal'></i></button>
                  </div>
                </div>
              </div>
              <div class="preview-img">
                <img src="${aiGeneratedImage}" alt="preview-img">
              </div>
            </div>
            <div class="editor-controls">
              <button class="reset-filter">Reset Filters</button>
              <div class="row">
                <button class="save-img">Save Image</button>
              </div>
            </div>
          `;
          editorBody.innerHTML = '';
          editorBody.appendChild(container);
          contentAdded = true;

          // Initialize the editor
          initializeEditor();
        }
        else {
          contentAdded = false;
          editorBody.innerHTML = ``;
        }

        const previewImg = editorBody.querySelector(".preview-img img");
        previewImg.src = aiGeneratedImage;

        
      });
    }
  });
}

// Send request to OpenAI API to generate images
const generateAiImages = async (userPrompt, userImgQuantity) => {
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: userPrompt,
        n: userImgQuantity,
        size: "512x512",
        response_format: "b64_json"
      }),
    });

// Handle errors from API response
    if (!response.ok) throw new Error("Failed to generate AI images. Make sure your API key is valid.");

    const { data } = await response.json();
    updateImageCard([...data]);
  } catch (error) {
    alert(error.message);
  } finally {
    generateBtn.removeAttribute("disabled");
    generateBtn.innerText = "Generate";
    isImageGenerating = false;
  }
}

const handleImageGeneration = (e) => {
  e.preventDefault();
  if (isImageGenerating) return;

  // Get user input and image quantity values
  const userPrompt = e.srcElement[0].value;
  const userImgQuantity = parseInt(e.srcElement[1].value);

  // Disable the generate button, update its text, and set the flag
  generateBtn.setAttribute("disabled", true);
  generateBtn.innerText = "Generating";
  isImageGenerating = true;

  // Creating HTML markup for image cards with loading state and buttons (edit - download)
  const imgCardMarkup = Array.from({ length: userImgQuantity }, () => 
      `<div class="img-card loading">
        <img src="assets/img/images/loading.webp" alt="AI generated image">
        <a href="#" class="edit-btn">
          <img src="assets/img/images/edit-icon.svg" alt="edit icon">
        </a>
        <a class="download-btn" href="#">
          <img src="assets/img/images/download icon.svg" alt="download icon">
        </a>
      </div>`
  ).join("");

  imageGallery.innerHTML = imgCardMarkup;
  generateAiImages(userPrompt, userImgQuantity);
}

generateForm.addEventListener("submit", handleImageGeneration);

// Initialize editor with the necessary event listeners and handlers
const initializeEditor = () => {
  const filterOptions = document.querySelectorAll(".filter button"),
        filterName = document.querySelector(".filter-info .name"),
        filterValue = document.querySelector(".filter-info .value"),
        filterSlider = document.querySelector(".slider input"),
        rotateOptions = document.querySelectorAll(".rotate button"),
        resetFilterBtn = document.querySelector(".reset-filter"),
        saveImgBtn = document.querySelector(".save-img"),
        previewImg = document.querySelector(".preview-img img");

  let brightness = "100", saturation = "100", inversion = "0", grayscale = "0";
  let rotate = 0, flipHorizontal = 1, flipVertical = 1;

  const applyFilter = () => {
    previewImg.style.transform = `rotate(${rotate}deg) scale(${flipHorizontal}, ${flipVertical})`;
    previewImg.style.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
  };

  filterOptions.forEach(option => {
    option.addEventListener("click", () => {
      document.querySelector(".active").classList.remove("active");
      option.classList.add("active");
      filterName.innerText = option.innerText;

      if (option.id === "brightness") {
        filterSlider.max = "200";
        filterSlider.value = brightness;
        filterValue.innerText = `${brightness}%`;
      } else if (option.id === "saturation") {
        filterSlider.max = "200";
        filterSlider.value = saturation;
        filterValue.innerText = `${saturation}%`;
      } else if (option.id === "inversion") {
        filterSlider.max = "100";
        filterSlider.value = inversion;
        filterValue.innerText = `${inversion}%`;
      } else {
        filterSlider.max = "100";
        filterSlider.value = grayscale;
        filterValue.innerText = `${grayscale}%`;
      }
    });
  });

  const updateFilter = () => {
    filterValue.innerText = `${filterSlider.value}%`;
    const selectedFilter = document.querySelector(".filter .active");

    if (selectedFilter.id === "brightness") {
      brightness = filterSlider.value;
    } else if (selectedFilter.id === "saturation") {
      saturation = filterSlider.value;
    } else if (selectedFilter.id === "inversion") {
      inversion = filterSlider.value;
    } else {
      grayscale = filterSlider.value;
    }
    applyFilter();
  };

  rotateOptions.forEach(option => {
    option.addEventListener("click", () => {
      if (option.id === "left") {
        rotate -= 90;
      } else if (option.id === "right") {
        rotate += 90;
      } else if (option.id === "horizontal") {
        flipHorizontal = flipHorizontal === 1 ? -1 : 1;
      } else {
        flipVertical = flipVertical === 1 ? -1 : 1;
      }
      applyFilter();
    });
  });

  const resetFilter = () => {
    brightness = "100";
    saturation = "100";
    inversion = "0";
    grayscale = "0";
    rotate = 0;
    flipHorizontal = 1;
    flipVertical = 1;
    filterOptions[0].click();
    applyFilter();
  };

  const saveImage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = previewImg.naturalWidth;
    canvas.height = previewImg.naturalHeight;

    ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if (rotate !== 0) {
      ctx.rotate(rotate * Math.PI / 180);
    }
    ctx.scale(flipHorizontal, flipVertical);
    ctx.drawImage(previewImg, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    const link = document.createElement("a");
    link.download = `${new Date().getTime()}-imaginator.jpg`;
    link.href = canvas.toDataURL();
    link.click();
  };

  filterSlider.addEventListener("input", updateFilter);
  resetFilterBtn.addEventListener("click", resetFilter);
  saveImgBtn.addEventListener("click", saveImage);
}

generateForm.addEventListener("submit", handleImageGeneration);



const accordionContent = document.querySelectorAll(".accordion-content");

accordionContent.forEach((item, index) => {
    let header = item.querySelector("header");
    header.addEventListener("click", () =>{
        item.classList.toggle("open");

        let description = item.querySelector(".description");
        if(item.classList.contains("open")){
            description.style.height = `${description.scrollHeight}px`; //scrollHeight property returns the height of an element including padding , but excluding borders, scrollbar or margin
            item.querySelector("i").classList.replace("fa-plus", "fa-minus");
        }else{
            description.style.height = "0px";
            item.querySelector("i").classList.replace("fa-minus", "fa-plus");
        }
        removeOpen(index); //calling the funtion and also passing the index number of the clicked header
    })
})

function removeOpen(index1){
    accordionContent.forEach((item2, index2) => {
        if(index1 != index2){
            item2.classList.remove("open");

            let des = item2.querySelector(".description");
            des.style.height = "0px";
            item2.querySelector("i").classList.replace("fa-minus", "fa-plus");
        }
    })
}
