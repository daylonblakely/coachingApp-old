import React, { useContext } from 'react';
import { Box, Text, FlatList, ScrollView } from 'native-base';
import { Context as DrillContext } from '../../context/DrillContext';
import DrillDetailCategoryHeader from '../../components/drills/DrillDetailCategoryHeader';
import DrillDetailTitle from '../../components/drills/DrillDetailTitle';
import ItemTag from '../../components/ItemTag';

const DrillDetailScreen = ({ route }) => {
  const { state } = useContext(DrillContext);

  const { id } = route.params;
  const drill = state.find((d) => d.id === id);

  return (
    <ScrollView>
      <DrillDetailCategoryHeader category={drill.category} />
      <Box>
        <DrillDetailTitle
          title={drill.title}
          isIndividual={drill.isIndvidual}
        />
        <FlatList
          horizontal
          data={drill.tags}
          renderItem={({ item }) => <ItemTag text={item} />}
          keyExtractor={(x, i) => i.toString()}
          showsHorizontalScrollIndicator={false}
        />
        <Text p="3">{drill.description}</Text>
        {/* TODO add drill comments */}
        {/* <Box variant="card">
            <Text>{drill.comments}</Text>
          </Box> */}
      </Box>
    </ScrollView>
  );
};

export default DrillDetailScreen;
