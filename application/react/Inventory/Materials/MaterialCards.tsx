import { observer } from 'mobx-react-lite';
import MaterialCard from './Material/MaterialCard.tsx';
import inventoryStore from '../../stores/inventoryStore.ts';
import { useQuery } from '@tanstack/react-query';
import { getMaterials } from '../../_queries/material.ts';
import { LoadingIndicator } from '../../_global/LoadingIndicator/LoadingIndicator.tsx';
import { useWebsocket } from '../../_hooks/useWebsocket.ts';
import { IMaterial } from '@shared/types/models';
import { MongooseIdStr } from '@shared/types/typeAliases';
import { useModal } from '../../_context/modalProvider.tsx';
import { MaterialDetailsModal } from '../MaterialDetailsModal/MaterialDetailsModal.tsx';
import clsx from 'clsx';
import * as styles from './MaterialCards.module.scss'
import * as sharedStyles from '@ui/styles/shared.module.scss'

const MaterialCards = observer(() => {
  const materials = inventoryStore.getFilteredMaterials()
  const { openModal } = useModal();

  useWebsocket('MATERIAL:CREATED', (material: IMaterial) => {
    inventoryStore.setMaterial(material)
  })

  useWebsocket('MATERIAL:UPDATED', (material: IMaterial) => {
    inventoryStore.setMaterial(material)
  })

  useWebsocket('MATERIAL:DELETED', (materialMongooseId: MongooseIdStr) => {
    inventoryStore.removeMaterial(materialMongooseId)
  })

  const { isPending, isFetching } = useQuery<IMaterial[]>({
    queryKey: ['get-materials'],
    queryFn: async () => {
      const materials = await getMaterials();
      inventoryStore.setMaterials(materials)

      return materials
    },
    initialData: []
  })

  if (isPending || isFetching) return <LoadingIndicator />;

  return (
    <div className={clsx(styles.materialCardSection, sharedStyles.fullWidth)} data-test='material-cards'>
      {materials.map((material) => (
        <MaterialCard
          material={material}
          key={material._id as string}
          onClick={() => openModal(MaterialDetailsModal, { material })}
        />
      ))}
    </div>
  )
});

export default MaterialCards;
