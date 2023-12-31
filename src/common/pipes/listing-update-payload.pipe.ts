import { BadRequestException, PipeTransform } from "@nestjs/common";

enum expectedPayloadObjectKeys {
  listingTextData = 'listingTextData',
  deletedListingImages = 'deletedListingImages'
}

export class ListingUpdatePayloadPipe implements PipeTransform {
  transform(value: any): any {
    const objectKeys = Object.keys(value);
    
    if (!objectKeys.length) {
      throw new BadRequestException('Payload should not be empty');
    }

    if (
        objectKeys.length === 2 &&
        (objectKeys.includes(expectedPayloadObjectKeys.listingTextData) && objectKeys.includes(expectedPayloadObjectKeys.deletedListingImages))
      )
    {
      // if no text data and NO deleted images data
      if (!Object.keys(value[expectedPayloadObjectKeys.listingTextData]).length && !value[expectedPayloadObjectKeys.deletedListingImages].length) {
        throw new BadRequestException('no text data and no image delete data')
      }
    }

    if (objectKeys.includes(expectedPayloadObjectKeys.listingTextData)) {
      if (!Object.keys(value.listingTextData).length) {
        throw new BadRequestException(
          'Listing text data payload should not be empty'
        );
      }
    }

    if (objectKeys.includes(expectedPayloadObjectKeys.deletedListingImages)) {
      if (!value.deletedListingImages.length) {
        throw new BadRequestException(
          'Deleted listing images array cannot be empty'
        );
      }
    }

    return value;
  }
}
