import { describe, expect, test } from 'vitest';
import {
  bovinoPhoto,
  onBovinoPhotoError,
  dataUrlToBlob,
  BOVINO_PLACEHOLDER,
} from '@/shared/utils/bovinoPhoto';

describe('bovinoPhoto utils', () => {
  test('bovinoPhoto devuelve placeholder para valor vacío', () => {
    expect(bovinoPhoto('')).toBe(BOVINO_PLACEHOLDER);
    expect(bovinoPhoto(null)).toBe(BOVINO_PLACEHOLDER);
    expect(bovinoPhoto(undefined)).toBe(BOVINO_PLACEHOLDER);
    expect(bovinoPhoto('   ')).toBe(BOVINO_PLACEHOLDER);
  });

  test('bovinoPhoto devuelve la URL si existe', () => {
    expect(bovinoPhoto('https://example.com/cow.jpg')).toBe('https://example.com/cow.jpg');
  });

  test('onBovinoPhotoError reemplaza src por placeholder', () => {
    const img = document.createElement('img');
    img.src = 'https://example.com/broken.jpg';
    const event = new Event('error');
    Object.defineProperty(event, 'target', { value: img, enumerable: true });

    onBovinoPhotoError(event);

    expect(img.src).toBe(BOVINO_PLACEHOLDER);
  });

  test('onBovinoPhotoError no reemplaza si ya es placeholder', () => {
    const img = document.createElement('img');
    img.src = BOVINO_PLACEHOLDER;
    const event = new Event('error');
    Object.defineProperty(event, 'target', { value: img, enumerable: true });

    onBovinoPhotoError(event);

    expect(img.src).toBe(BOVINO_PLACEHOLDER);
  });

  test('dataUrlToBlob convierte base64 a Blob', () => {
    const blob = dataUrlToBlob('data:image/jpeg;base64,SGVsbG8=');
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('image/jpeg');
  });
});
