import React, { useState } from 'react';
import { Box, Button, Grid, styled } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ClearIcon from '@mui/icons-material/Clear';


const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const Container = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: "10px",
  borderRadius: "8px",
  backgroundColor: "#f5f5f5",
  transition: "border-color 0.3s",
  "&:hover": {
    borderColor: "#1565c0",
  },
});

interface PhotoUploaderProps {
  name: string;
  label: string;
  value?: string[];
  onChange: (photos: File[]) => void;
  isRemoved?: boolean;
  multiple?: boolean;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ name, label, onChange, multiple, isRemoved }) => {
  const [photos, setPhotos] = useState<File[]>([]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newPhotos = Array.from(event.target.files);
      setPhotos(prevPhotos => {
        const photos = multiple?[...prevPhotos, ...newPhotos]:newPhotos;
        onChange(photos)
        return photos;
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prevPhotos => prevPhotos.filter((_, i) => i !== index));
    onChange(photos);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Button component="label" variant="outlined" startIcon={<CameraAltIcon />} fullWidth>
          {label}
          <VisuallyHiddenInput name={name} type="file" multiple={multiple} capture accept="image/*" onChange={handlePhotoUpload}/>
        </Button>
      </Grid>

      {photos.length > 0 && (
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {photos.map((photo, index) => (
              <Grid item xs={12} key={index}>
                <Container>
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Foto ${index + 1}`}
                    style={{ width: 'auto', height: '100px', objectFit: 'cover'}}
                  />
                  {isRemoved&&<Button color="error" sx={{mt:'auto'}} size='small' onClick={() => removePhoto(index)} fullWidth variant="outlined"><ClearIcon/></Button>}
                </Container>
              </Grid>
            ))}
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

export default PhotoUploader;