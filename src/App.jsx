import React, { useState } from 'react'
import './App.css';
import { Stack, Heading, Input, Flex, HStack, Image, Button, Box, Text } from '@chakra-ui/react'
import ReactCrop from 'react-image-crop'
import Loading from './component/Loading';
import { isMobile } from "react-device-detect"

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

  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setTargetImage(reader.result)
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  }

  const handleImageLoad = (image) => {
    setImageRef(image)
  }

  const handleCropChange = (crop, percentCrop) => {
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
      const croppedImageUrl2 = await getCroppedImg(
        imageRef,
        crop,
        'croppedImageRight.jpeg',
        crop.width
      );
      setCroppedImageRightUrl(croppedImageUrl2);
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
            //reject(new Error('Canvas is empty'));
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

  return (
    <Flex
      m="0"
      w="100vw"
      bg="white.500"
      boxShadow="md"
      rounded="lg"
    >
        <Stack marginX="4" mt="4" mb="16" flexDirection="column" justifyContent="start">
          <Box>
            <Heading fontSize="2xl">画像2分割</Heading>
            <Input type="file" colorScheme="blue" border="none" padding="0" onChange={handleImageSelect} />
          </Box>
          {targetImage && (
            <ReactCrop 
              ruleOfThirds
              zoom
              keepSelection
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
              <Box m="0" p="0" borderColor="black" borderWidth="thin" borderStyle="dashed">
                <Image alt="Crop" maxWidth="45vw" src={croppedImageLeftUrl} />
              </Box>
              <Box m="0" p="0" borderColor="black" borderWidth="thin" borderStyle="dashed">
                <Image alt="Crop" maxWidth="45vw" src={croppedImageRightUrl} />
              </Box>
            </HStack>
          )}
          </>
          )}
          <Text color="gray">※スマホ場合で画像を保存する場合は、各画像を長押しして画像を保存してください。</Text>
        </Stack>
      {!isMobile && (
      <Button 
        disabled={isLoading} 
        onClick={saveImages} 
        isFullWidth 
        position="fixed" 
        bottom="0" 
        colorScheme="twitter"
      >
        保存
      </Button>
      )}
    </Flex>
  );
}

export default App;
