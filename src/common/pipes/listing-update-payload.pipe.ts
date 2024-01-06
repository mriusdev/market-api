import { BadRequestException, PipeTransform } from "@nestjs/common";

export enum ModifyListingPayloadKeys {
  listingTextData = 'listingTextData',
  modifiedListingImageData = 'modifiedListingImageData'
}

export enum ModifyListingImageDataKeys {
  deletedImageIds = 'deletedImageIds',
  newImagesAdded = 'newImagesAdded'
}

export class ListingUpdatePayloadPipe implements PipeTransform {
  transform(value: any): any {
    const objectKeys = Object.keys(value);
    
    if (!objectKeys.length) {
      throw new BadRequestException('Payload should not be empty');
    }

    if (
        objectKeys.length === 2 &&
        (objectKeys.includes(ModifyListingPayloadKeys.listingTextData) && objectKeys.includes(ModifyListingPayloadKeys.modifiedListingImageData))
      )
    {
      // if no text data and NO deleted images data
      if (!Object.keys(value[ModifyListingPayloadKeys.listingTextData]).length && !value[ModifyListingPayloadKeys.modifiedListingImageData].length) {
        throw new BadRequestException('Payload should not be empty')
      }
    }

    if (objectKeys.includes(ModifyListingPayloadKeys.listingTextData)) {
      if (!Object.keys(value.listingTextData).length) {
        throw new BadRequestException(
          'Listing text data payload should not be empty'
        );
      }
    }

    if (objectKeys.includes(ModifyListingPayloadKeys.modifiedListingImageData)) {
      // make sure array is not empty if it's included

      const modifiedListingImageDataKeys = Object.keys(value[ModifyListingPayloadKeys.modifiedListingImageData]);

      if (modifiedListingImageDataKeys.includes('deletedImageIds') && !value.modifiedListingImageData.deletedImageIds?.length) {
        throw new BadRequestException(
          'Deleted listing images array cannot be empty'
        );
      }

      // if (!value.deletedListingImages.length) {
        
      // }
    }

    return value;
  }
}
