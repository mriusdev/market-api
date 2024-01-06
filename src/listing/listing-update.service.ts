import { Inject, Injectable } from "@nestjs/common";
import { ListingUpdateDTO } from "./dto";
import { ModifyListingImageDataKeys, ModifyListingPayloadKeys } from "../common/pipes";
import { PrismaService } from "../prisma/prisma.service";
import { Listing } from "@prisma/client";
import { ListingImagesService } from "./listing-images.service";

export enum ListingUpdateTypes {
  MIXED = 'mixed',
  ADD_IMAGE = 'add_mage',
  MODIFY_TEXT = 'modify_text',
  DELETE_IMAGE = 'delete_image',
  MIXED_IMAGE = 'mixed_image'
}

export const ListingSaveImageUpdateTypes = [
  ListingUpdateTypes.MIXED,
  ListingUpdateTypes.ADD_IMAGE,
  ListingUpdateTypes.MIXED_IMAGE
];

@Injectable()
export class ListingUpdateService
{
  private dto: ListingUpdateDTO;
  private listing: Listing;

  constructor(private prisma: PrismaService, private listingImagesService: ListingImagesService) {}

  setValues(dto: ListingUpdateDTO, listing: Listing): ListingUpdateService
  {
    this.dto = dto;
    this.listing = listing;
    return this;
  }

  async handleUpdates(): Promise<void>
  {
    const updateType = this.getListingUpdateType();
    // possible actions
    // mixed - text, all image changes
    // modify_text - only text
    // added new image & removed
    // added new image
    // remove image

    switch (updateType) {
      case ListingUpdateTypes.MIXED:
        await this.updateMixedData();
        break;
      case ListingUpdateTypes.MODIFY_TEXT:
        await this.updateText();
        break;
      case ListingUpdateTypes.MIXED_IMAGE:
      case ListingUpdateTypes.DELETE_IMAGE:
        await this.deleteImages();
        break;
      // case ListingUpdateTypes.ADD_IMAGE:
      //   await this.updateListingImagesAdd();
      //   break;
      // case ListingUpdateTypes.DELETE_IMAGE:
      //   await this.deleteImages()
      //   break;
    }

    if (ListingSaveImageUpdateTypes.includes(updateType)) {
      console.log('add image action starting');
      
      await this.listingImagesService.saveImages(this.listing)
        .catch(() => {});
    }
  }

  async deleteImages(): Promise<void>
  {
    let invalidImageIdDetected = false;
    
    if (
      !this.dto.modifiedListingImageData.deletedImageIds ||
      !this.dto.modifiedListingImageData.deletedImageIds?.length
      )
    {
      return;
    }

    const currentImageIds = this.listing['listingImages'].map(value => value.id);

    for (let i = 0; i < this.dto.modifiedListingImageData.deletedImageIds.length; i++) {
      // if (invalidImageIdDetected) {
      //   break;
      // }
      if (!currentImageIds.includes(this.dto.modifiedListingImageData.deletedImageIds[i])) {
        invalidImageIdDetected = true;
        break;
      }
    }

    if (invalidImageIdDetected) {
      return;
    }

    console.log('image ids to delete', this.dto.modifiedListingImageData.deletedImageIds);


    const filteredListingImagesToDelete = this.listing['listingImages'].filter(image => {
      for (const imageIdToDelete of this.dto.modifiedListingImageData.deletedImageIds) {
        if (imageIdToDelete !== image.id) {
          return false;
        }
        return true;
      }
    })
    console.log('filtered images to delete', filteredListingImagesToDelete);

    if (!filteredListingImagesToDelete.length) {
      return;
    }
    
    const s3DeleteImageKeys = filteredListingImagesToDelete.map(image => image.imageLocation);
    console.log('s3 image keys', s3DeleteImageKeys);
    

    await this.listingImagesService.deleteImages(s3DeleteImageKeys);
    await this.prisma.listingImages.deleteMany({
      where: {
        id: {
          in: this.dto.modifiedListingImageData.deletedImageIds
        }
      }
    });
  }

  async updateMixedData(): Promise<void>
  {
    await this.updateText();
    await this.deleteImages();
  }

  async updateText(): Promise<void>
  {
    await this.prisma.listing.update({
      data: {
        title: this.dto.listingTextData.title,
        price: this.dto.listingTextData.price,
        description: this.dto.listingTextData.description
      },
      where: {
        id: this.listing.id
      }
    });
  }

  getListingUpdateType(): ListingUpdateTypes
  {
    const objectKeys = Object.keys(this.dto);
    if (objectKeys.length > 1) {
      return ListingUpdateTypes.MIXED;
    }
    if (objectKeys[0] === ModifyListingPayloadKeys.listingTextData) {
      return ListingUpdateTypes.MODIFY_TEXT;
    }
    if (objectKeys[0] === ModifyListingPayloadKeys.modifiedListingImageData) {
      // chekc how many keys?
      const modifyImageKeys = Object.keys(this.dto[ModifyListingPayloadKeys.modifiedListingImageData]);
      // deletedImages: []
      // addNewImages: boolean
      if (modifyImageKeys.length === 1) {
        if (modifyImageKeys[0] === ModifyListingImageDataKeys.deletedImageIds) {
          return ListingUpdateTypes.DELETE_IMAGE;
        }
        return ListingUpdateTypes.ADD_IMAGE
      }
      return ListingUpdateTypes.MIXED_IMAGE;
      // return both delete and add new image
      // only image data was modified and we want to do that and not do any text updates
      // update listing 
    }
    return ListingUpdateTypes.ADD_IMAGE;
  }
}