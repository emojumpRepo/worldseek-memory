import { i18nT } from '../../../web/i18n/utils';

/* ------------ dataset -------------- */
export enum DatasetTypeEnum {
  folder = 'folder',
  dataset = 'dataset',
  websiteDataset = 'websiteDataset', // depp link
  externalFile = 'externalFile',
  apiDataset = 'apiDataset'
  // feishu = 'feishu',
  // yuque = 'yuque'
}
export const DatasetTypeMap = {
  [DatasetTypeEnum.folder]: {
    icon: 'common/folderFill',
    label: i18nT('dataset:folder_dataset'),
    collectionLabel: i18nT('common:Folder')
  },
  [DatasetTypeEnum.dataset]: {
    icon: 'core/dataset/commonDatasetOutline',
    label: i18nT('dataset:common_dataset'),
    collectionLabel: i18nT('common:common.File')
  },
  [DatasetTypeEnum.websiteDataset]: {
    icon: 'core/dataset/websiteDatasetOutline',
    label: i18nT('dataset:website_dataset'),
    collectionLabel: i18nT('common:common.Website')
  },
  [DatasetTypeEnum.externalFile]: {
    icon: 'core/dataset/externalDatasetOutline',
    label: i18nT('dataset:external_file'),
    collectionLabel: i18nT('common:common.File')
  },
  [DatasetTypeEnum.apiDataset]: {
    icon: 'core/dataset/externalDatasetOutline',
    label: i18nT('dataset:api_file'),
    collectionLabel: i18nT('common:common.File')
  }
  // [DatasetTypeEnum.feishu]: {
  //   icon: 'core/dataset/feishuDatasetOutline',
  //   label: i18nT('dataset:feishu_dataset'),
  //   collectionLabel: i18nT('common:common.File')
  // },
  // [DatasetTypeEnum.yuque]: {
  //   icon: 'core/dataset/yuqueDatasetOutline',
  //   label: i18nT('dataset:yuque_dataset'),
  //   collectionLabel: i18nT('common:common.File')
  // }
};

export enum DatasetStatusEnum {
  active = 'active',
  syncing = 'syncing',
  waiting = 'waiting',
  error = 'error'
}
export const DatasetStatusMap = {
  [DatasetStatusEnum.active]: {
    label: i18nT('common:core.dataset.status.active')
  },
  [DatasetStatusEnum.syncing]: {
    label: i18nT('common:core.dataset.status.syncing')
  },
  [DatasetStatusEnum.waiting]: {
    label: i18nT('common:core.dataset.status.waiting')
  },
  [DatasetStatusEnum.error]: {
    label: i18nT('dataset:status_error')
  }
};

/* ------------ collection -------------- */
export enum DatasetCollectionTypeEnum {
  folder = 'folder',
  virtual = 'virtual',

  file = 'file',
  link = 'link', // one link
  externalFile = 'externalFile',
  apiFile = 'apiFile'
}
export const DatasetCollectionTypeMap = {
  [DatasetCollectionTypeEnum.folder]: {
    name: i18nT('common:core.dataset.folder')
  },
  [DatasetCollectionTypeEnum.file]: {
    name: i18nT('common:core.dataset.file')
  },
  [DatasetCollectionTypeEnum.externalFile]: {
    name: i18nT('common:core.dataset.externalFile')
  },
  [DatasetCollectionTypeEnum.link]: {
    name: i18nT('common:core.dataset.link')
  },
  [DatasetCollectionTypeEnum.virtual]: {
    name: i18nT('common:core.dataset.Manual collection')
  },
  [DatasetCollectionTypeEnum.apiFile]: {
    name: i18nT('common:core.dataset.apiFile')
  }
};

export enum DatasetCollectionSyncResultEnum {
  sameRaw = 'sameRaw',
  success = 'success',
  failed = 'failed'
}
export const DatasetCollectionSyncResultMap = {
  [DatasetCollectionSyncResultEnum.sameRaw]: {
    label: i18nT('common:core.dataset.collection.sync.result.sameRaw')
  },
  [DatasetCollectionSyncResultEnum.success]: {
    label: i18nT('common:core.dataset.collection.sync.result.success')
  },
  [DatasetCollectionSyncResultEnum.failed]: {
    label: i18nT('dataset:sync_collection_failed')
  }
};

export enum DatasetCollectionDataProcessModeEnum {
  chunk = 'chunk',
  qa = 'qa',
  auto = 'auto' // abandon
}
export const DatasetCollectionDataProcessModeMap = {
  [DatasetCollectionDataProcessModeEnum.chunk]: {
    label: i18nT('common:core.dataset.training.Chunk mode'),
    tooltip: i18nT('common:core.dataset.import.Chunk Split Tip')
  },
  [DatasetCollectionDataProcessModeEnum.qa]: {
    label: i18nT('common:core.dataset.training.QA mode'),
    tooltip: i18nT('common:core.dataset.import.QA Import Tip')
  },
  [DatasetCollectionDataProcessModeEnum.auto]: {
    label: i18nT('common:core.dataset.training.Auto mode'),
    tooltip: i18nT('common:core.dataset.training.Auto mode Tip')
  }
};

export enum ChunkSettingModeEnum {
  auto = 'auto',
  custom = 'custom'
}

export enum DataChunkSplitModeEnum {
  size = 'size',
  char = 'char'
}

/* ------------ data -------------- */

/* ------------ training -------------- */
export enum ImportDataSourceEnum {
  fileLocal = 'fileLocal',
  fileLink = 'fileLink',
  fileCustom = 'fileCustom',
  csvTable = 'csvTable',
  externalFile = 'externalFile',
  apiDataset = 'apiDataset',
  reTraining = 'reTraining'
}

export enum TrainingModeEnum {
  chunk = 'chunk',
  qa = 'qa',
  auto = 'auto',
  image = 'image'
}

/* ------------ search -------------- */
export enum DatasetSearchModeEnum {
  embedding = 'embedding',
  fullTextRecall = 'fullTextRecall',
  mixedRecall = 'mixedRecall'
}

export const DatasetSearchModeMap = {
  [DatasetSearchModeEnum.embedding]: {
    icon: 'core/dataset/modeEmbedding',
    title: i18nT('common:core.dataset.search.mode.embedding'),
    desc: i18nT('common:core.dataset.search.mode.embedding desc'),
    value: DatasetSearchModeEnum.embedding
  },
  [DatasetSearchModeEnum.fullTextRecall]: {
    icon: 'core/dataset/fullTextRecall',
    title: i18nT('common:core.dataset.search.mode.fullTextRecall'),
    desc: i18nT('common:core.dataset.search.mode.fullTextRecall desc'),
    value: DatasetSearchModeEnum.fullTextRecall
  },
  [DatasetSearchModeEnum.mixedRecall]: {
    icon: 'core/dataset/mixedRecall',
    title: i18nT('common:core.dataset.search.mode.mixedRecall'),
    desc: i18nT('common:core.dataset.search.mode.mixedRecall desc'),
    value: DatasetSearchModeEnum.mixedRecall
  }
};

export enum SearchScoreTypeEnum {
  embedding = 'embedding',
  fullText = 'fullText',
  reRank = 'reRank',
  rrf = 'rrf'
}
export const SearchScoreTypeMap = {
  [SearchScoreTypeEnum.embedding]: {
    label: i18nT('common:core.dataset.search.mode.embedding'),
    desc: i18nT('common:core.dataset.search.score.embedding desc'),
    showScore: true
  },
  [SearchScoreTypeEnum.fullText]: {
    label: i18nT('common:core.dataset.search.score.fullText'),
    desc: i18nT('common:core.dataset.search.score.fullText desc'),
    showScore: false
  },
  [SearchScoreTypeEnum.reRank]: {
    label: i18nT('common:core.dataset.search.score.reRank'),
    desc: i18nT('common:core.dataset.search.score.reRank desc'),
    showScore: true
  },
  [SearchScoreTypeEnum.rrf]: {
    label: i18nT('common:core.dataset.search.score.rrf'),
    desc: i18nT('common:core.dataset.search.score.rrf desc'),
    showScore: false
  }
};

export const CustomCollectionIcon = 'common/linkBlue';
export const LinkCollectionIcon = 'common/linkBlue';

/* source prefix */
export enum DatasetSourceReadTypeEnum {
  fileLocal = 'fileLocal',
  link = 'link',
  externalFile = 'externalFile',
  apiFile = 'apiFile',
  reTraining = 'reTraining'
}
