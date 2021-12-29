import React, { useState, useRef } from 'react'
import './App.css';
import { Stack, Heading, Flex, HStack, VStack, Image, Button, Box, Text, Spacer } from '@chakra-ui/react'
import ReactCrop from 'react-image-crop'
import Loading from './component/Loading';
// import { isMobile } from "react-device-detect"

function App() {
  const [targetImage, setTargetImage] = useState('')
  const [imageRef, setImageRef] = useState()
  const [croppedImageLeftUrl, setCroppedImageLeftUrl] = useState()
  const [croppedImageRightUrl, setCroppedImageRightUrl] = useState()
  const [crop, setCrop] = useState({ 
    aspect: 1 / 1,
    width: 1080,
  });
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef()
  const [maxWidth, setMaxWidth] = useState()

  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setTargetImage(reader.result)
      })
      reader.readAsDataURL(e.target.files[0]);
    }
  }


  const handleImageLoad = (image) => {
    setMaxWidth(image.width / 2)
    setImageRef(image)
  }

  const handleCropChange = (crop, percentCrop) => {
    console.log(crop)
    setCrop(crop)
  }

  const handleCropComplete = async (crop) => {
    setIsLoading(true)
    if (imageRef && crop.width && crop.height) {
      const croppedImageUrl = await getCroppedImg(
        imageRef,
        crop,
        'croppedImageLeft.jpeg',
        0
      );
      setCroppedImageLeftUrl(croppedImageUrl);
      const croppedImageRightUrl = await getCroppedImg(
        imageRef,
        crop,
        'croppedImageRight.jpeg',
        crop.width
      );
      setCroppedImageRightUrl(croppedImageRightUrl);
    }
    setIsLoading(false)
  };

  const getCroppedImg = async (image, crop, fileName, xOffset) => {
    const canvas = document.createElement('canvas');
    const pixelRatio = window.devicePixelRatio;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext('2d');

    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      (crop.x+xOffset) * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          blob.name = fileName;
          const fileUrl = window.URL.createObjectURL(blob);
          resolve(fileUrl);
        },
        'image/jpeg',
        1
      );
    });
  }

  const saveLeftImage = () => {
    let dlLink = document.createElement('a')
    dlLink.href = croppedImageLeftUrl
    dlLink.download = 'left.png'
    dlLink.click()
  }

  const saveRightImage = () => {
    let dlLink = document.createElement('a')
    dlLink.href = croppedImageRightUrl
    dlLink.download = 'right.png'
    dlLink.click()
  }

  const saveImages = () => {
    let dlLink = document.createElement('a')
    dlLink.href = croppedImageLeftUrl
    dlLink.download = 'left.png'
    dlLink.click()

    let dlLink2 = document.createElement('a')
    dlLink2.href = croppedImageRightUrl
    dlLink2.download = 'right.png'
    dlLink2.click()
  }

  const fileUpload = () => {
    console.log(inputRef.current);
    inputRef.current.click();
  }

  const divideTwo = () => {
    const newCrop = {
      unit: 'px',
      x: 0,
      y: 0,
      width: imageRef.width/2,
      height: imageRef.height,
      aspect: false,
    }
    setCrop(newCrop)
    handleCropComplete(newCrop)
  }

  const squareAspect = () => {
    const newCrop = {
      unit: 'px',
      x: 0,
      y: 0,
      width: imageRef.width/2,
      aspect: 1,
    }
    setCrop(newCrop)
    handleCropComplete(newCrop)
  }

  return (
    <Flex
      m="0"
      w="100vw"
      bg="white.500"
      rounded="lg"
      flexDirection="column"
    >
      <Flex backgroundColor="white" px="4" py="4" boxShadow="md" w="100%" alignItems="center" justifyContent="space-between">
        <Heading fontSize={{ base: "xl", md: "2xl"}} whiteSpace="nowrap" >画像2分割</Heading>
        <Spacer />
        {targetImage && (
          <>
            <Button mr={{ base: "2", md: "4" }} onClick={divideTwo} colorScheme="orange" size="sm">2分割</Button>
            <Button mr={{ base: "2", md: "4" }} onClick={squareAspect} colorScheme="blackAlpha"  size="sm">正方形</Button>
          </>
        )}
        <Button onClick={fileUpload} colorScheme="twitter"  size="sm">
          画像を選択
        </Button>
        <input type="file" hidden accept="image/*" ref={inputRef} onChange={handleImageSelect} />
      </Flex>
      <Stack mx="4" mt="4" mb="16" flexDirection="column" justifyContent="start" >
        {targetImage && (
          <ReactCrop 
            ruleOfThirds
            zoom
            keepSelection
            maxWidth={maxWidth}
            src={targetImage} 
            onChange={handleCropChange}
            onImageLoaded={handleImageLoad}
            onComplete={handleCropComplete}
            crop={crop}
            mt="0"
          >
          </ReactCrop>
        )}
        <Heading fontSize="2xl">分割後イメージ</Heading>
        {isLoading ? (
      <Loading />
    ) : (
      <>
        {croppedImageLeftUrl && (
          <HStack spacing="0">
            <VStack>
              <Box m="0" p="0" borderColor="black" borderWidth="thin" borderStyle="dashed">
                <Image alt="Crop" maxWidth="45vw" src={croppedImageLeftUrl} />
              </Box>
              <Button 
                disabled={isLoading} 
                onClick={saveLeftImage} 
                colorScheme="twitter"
              >
                左側保存
              </Button>
            </VStack>
            <VStack>
              <Box m="0" p="0" borderColor="black" borderWidth="thin" borderStyle="dashed">
                <Image alt="Crop" maxWidth="45vw" src={croppedImageRightUrl} />
              </Box>
              <Button 
                disabled={isLoading} 
                onClick={saveRightImage} 
                colorScheme="twitter"
              >
                右側保存
              </Button>
            </VStack>
          </HStack>
        )}
        </>
        )}
        <Text color="gray">※スマホ場合で画像を保存する場合は、各画像を長押しして画像を保存してください。</Text>
      </Stack>
      {/* {!isMobile && ( */}
      {/* <Button 
        disabled={isLoading} 
        onClick={saveImages} 
        isFullWidth 
        position="fixed" 
        bottom="0" 
        colorScheme="twitter"
      >
        保存
      </Button> */}
      {/* )} */}
    </Flex>
  );
}

export default App;
