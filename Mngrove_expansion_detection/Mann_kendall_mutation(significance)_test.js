var beihai_rigion = 
    /* color: #00ffff */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[108.99122143694129, 21.617667936639286],
          [108.99122143694129, 21.56531385989073],
          [109.12700558611121, 21.56531385989073],
          [109.12700558611121, 21.617667936639286]]], null, false),
    Beibu_Gulf = 
    /* color: #d63000 */
    /* shown: false */
    ee.Geometry.Polygon(
        [[[108.03863371743522, 21.608674770428376],
          [108.00284902409305, 21.549522266929706],
          [108.04259449632949, 21.54720395801876],
          [108.06440053733765, 21.524049194547242],
          [108.12171711703503, 21.47646933658755],
          [108.66377509215829, 21.47836848250364],
          [108.9851223779623, 21.52692100089574],
          [109.03181383484089, 21.337730266972184],
          [109.5893651203562, 21.42468617922647],
          [109.73493269148673, 21.440025991591952],
          [109.59760484433835, 20.976570283257736],
          [109.70093578550251, 20.454643359745738],
          [109.84375691395965, 20.22286455990516],
          [109.86298286948316, 20.050093298712742],
          [109.59382002118379, 20.050093258908],
          [109.39332116635994, 19.972671197872007],
          [109.2038085406001, 19.94685539165488],
          [109.09394613090686, 19.789287691155796],
          [108.945878977919, 19.632754325728023],
          [108.90193399830461, 19.547364290425854],
          [109.06398103406868, 19.379039688647534],
          [109.33863708383443, 19.65862111367423],
          [109.73963484785692, 19.762046661480763],
          [110.0719685674345, 19.898728465651278],
          [110.18183093535016, 19.971024158140683],
          [110.14584582017267, 20.49034330801552],
          [109.93710721768535, 20.901433603289842],
          [110.01950386772295, 21.265335946685468],
          [110.21176285410709, 21.490403360195728],
          [110.16781785584126, 21.68450009741745],
          [109.83199743958401, 21.540555277650594],
          [109.77157314880985, 21.635049554513497],
          [109.71114885816122, 21.76009551357216],
          [109.64660474281125, 21.850622066423284],
          [109.36508260219642, 21.858269557007755],
          [109.14810456441263, 21.874837760175225],
          [108.90366095105281, 21.8684656355792],
          [108.73434462542153, 21.942259952145502],
          [108.58465725256058, 21.951176309928062],
          [108.23584441690828, 21.846693098384222],
          [108.10538286154004, 21.712791936082898]]]),
    mangrove_2019 = ee.FeatureCollection("users/NO1/Mangrove_production/mangrove_of_China_for_2019"),
    mangrove_2021 = ee.Image("users/NO1/2022new_mangrove/1986_2021_landsat_sentinel2_mangrove_region");

Map.centerObject(beihai_rigion, 12);
var box = Beibu_Gulf;
var startYear = 1986; 
var endYear = 2021; 
var year_lenth = endYear - startYear;
var startDay = '-01-01'; 
var endDay =   '-12-31';
var ifwater=1; //water mask 0:retaining 1:removing
var ifsentinl2=true; //water mask 0:retaining 1:removing
var value_selectList = ['max','min','mean','median'];
mangrove_2019 = mangrove_2019.map(function(PL){return PL.buffer(100)});
//mangrove_2019. Chuanpeng Zhao, Cheng-Zhi Qin. A fine resolution mangrove map of China for 2019 derived from 
//satellite observations and Google Earth images[DS/OL]. V2. Science Data Bank, 2021[2025-02-23]. 
//10-m-resolution https://cstr.cn/31253.11.sciencedb.00245. CSTR:31253.11.sciencedb.00245.

/******************************************/
/**********MK mutation  testing ***********/
/******************************************/
//*************Start************//
var distrb_band = function(img){
  var UFk_band = img.select('UFk');
  var UBk_band = img.select('UBk'); 
  var time = ee.Image(img.date().difference(1970,'year')).add(1970).floor().float();
  var UFk_bandmask = UFk_band.subtract(UBk_band).unmask(-999);
  var new_image = UFk_band.subtract(UBk_band).addBands(time).addBands(UFk_band).addBands(UFk_bandmask).select([0,1,2,3],['distrb','time','UFk','UFk_bandmask']).set('system:time_start', img.get('system:time_start'));
  return new_image;
};

var min_disturb_function = function(image){return image.select([0]).abs().addBands(image.select([1,2]));};

  var MK_break_select = function(FBimagecol){
    var value_fb = FBimagecol.select([1]).toArray();  //0:year,1:UFK-UFB
    var image_0 = ee.Image(0).int().toArray().arrayRepeat(0,value_fb.arrayLength(0));
    var one_fuone = value_fb.gt(image_0).multiply(2).subtract(1).int();//.arrayAccum(1,'sum').eq(0);
    var zero = ee.Image(0).toArray(0).arrayRepeat(0,2).int();
    var uparray = ee.ImageCollection([one_fuone, zero]).toArrayPerBand(0).arrayAccum(0,'sum');
    var downarray= ee.ImageCollection([zero, one_fuone]).toArrayPerBand(0).arrayAccum(0,'sum');
    var diff = uparray.subtract(downarray).arraySlice(0,0,-2).eq(0);//.arrayLength(0);
    var year_fb = FBimagecol.select([0]).toArray(0).arrayMask(diff);
    var break_points = year_fb.arrayLength(0).lt(2);
    return break_points;
  };

var index_list = ['NDVI','EVI','GDVI','NDMIw'];
var number_index =index_list.length;
// for(var pp = 0;pp<number_index;pp++){ 
  var index_put = index_list[0];
  var type_put = 'max';//value_select = type_put
  var all_annual_image = makeLtStack(startYear, endYear, startDay, endDay, box, ifwater, ifsentinl2, index_put, type_put);
  all_annual_image = ee.ImageCollection(all_annual_image);
  // print('all_annual_image',all_annual_image);
  // Map.addLayer(all_annual_image,{min:0,max:1,palette:["9400d3","4b0082","0000ff","00ff00","ffff00","ff7f00","ff0000"]},'all_annual_image'+index_put);
  //Get imagecollection of 2021-1987 is generated in reverse chronological order
  var reverse_all_annual_image = all_annual_image.sort('system:time_start',false);
  
  //UF_Sk(or UB_Sk) is the number of NDVI values of the year and years before that year that are greater than those of the previous year
  //Ex is the sample mean
  //Var is the variance of the sample
  //N is the number of samples
  //UFK and UBK are m-k values
   
  var all_annual_image_list = all_annual_image.toList(50);
  var reverse_all_annual_image_list  = reverse_all_annual_image.toList(50);
  var UF_Sk = ee.Image([0]).float();
  var UB_Sk = ee.Image([0]).float();
  var EX = ee.Image([0]).float(); 
  var Var = ee.Image([0]).float(); 
  var UF_Sk_imagecol = [];
  var UB_Sk_imagecol = [];
  var N , UFk , UBk;
  
  //Now let's start calculating these values: 'UF_Sk','EX','Var','UFk','UBk'
  for(var i = 0 ; i < year_lenth ; i++ )
    {
      for(var j = 0 ; j < i ; j++ )
        {
          var UF_sum = ee.Image(all_annual_image_list.get(i)).gt(ee.Image(all_annual_image_list.get(j))).unmask(0).float();
          //var UF_sum_1 = UF_sum.where(UF_sum.gt(0),1).float();
              UF_Sk = UF_Sk.add(UF_sum);
          var UB_sum = ee.Image(reverse_all_annual_image_list.get(i)).gt(ee.Image(reverse_all_annual_image_list.get(j))).unmask(0).float();
          //var UB_sum_1 = UB_sum.where(UB_sum.gt(0),1).float();
              UB_Sk = UB_Sk.add(UB_sum);
        }
      
      if(i === 0)//'UF_Sk','EX','Var','UFk','UBk' is equal to zero  in  first year   
        {
          var addUF_band_image = ee.Image(all_annual_image_list.get(i))
                                   .addBands([UF_Sk,EX,Var])
                                   .select([0,1,2,3],[index_put+'_'+type_put,'UF_Sk','EX','Var']);
                                   
              addUF_band_image = addUF_band_image.addBands((addUF_band_image.select('UF_Sk')).subtract(addUF_band_image.select('EX')).divide(addUF_band_image.select('Var').sqrt()))
                                                 .select([0,1,2,3,4],[index_put+'_'+type_put,'UF_Sk','EX','Var','UFk'])
                                                // .reproject(projection)
                                                 .set('system:time_start', (new Date(startYear+i,8,1)).valueOf());
              
              addUB_band_image = ee.Image(reverse_all_annual_image_list.get(i))
                                   .addBands([UB_Sk,EX,Var])
                                   .select([0,1,2,3],[index_put+'_'+type_put,'UB_Sk','EX','Var']);
                                   
              addUB_band_image = addUB_band_image.addBands((addUB_band_image.select('UB_Sk')).subtract(addUB_band_image.select('EX')).divide(addUB_band_image.select('Var').sqrt()))
                                                 .select([0,1,2,3,4],[index_put+'_'+type_put,'UB_Sk','EX','Var','UBk'])
                                                 .set('system:time_start', (new Date(endYear-i,8,1)).valueOf());
             
              UF_Sk_imagecol.push(addUF_band_image);
              UB_Sk_imagecol.push(addUB_band_image);
        }
      else
        {
              var N1 = ee.ImageCollection(all_annual_image_list.slice(0,i+1,1)).count().float();
              var EX1 = N1.multiply(N1.add(1)).divide(4); 
              var Var1 = N1.multiply(N1.subtract(1)).multiply(N1.multiply(2).add(5)).divide(72);
              
              var N2 = ee.ImageCollection(reverse_all_annual_image_list.slice(0,i+1,1)).count().float();
              var EX2 = N2.multiply(N2.add(1)).divide(4); 
              var Var2 = N2.multiply(N2.subtract(1)).multiply(N2.multiply(2).add(5)).divide(72);
              
              
          var addUF_band_image = ee.Image(all_annual_image_list.get(i))
                                   .addBands([UF_Sk.select(0),EX1.select(0),Var1.select(0)])
                                   .select([0,1,2,3],[index_put+'_'+type_put,'UF_Sk','EX','Var']);
                                   
              UFk = ee.Image(1).multiply(addUF_band_image.select('UF_Sk')).subtract(addUF_band_image.select('EX')).divide(addUF_band_image.select('Var').sqrt());
              addUF_band_image = addUF_band_image.addBands(UFk.select(0).rename('UFk'))
                                      .select([0,1,2,3,4],[index_put+'_'+type_put,'UF_Sk','EX','Var','UFk'])
                                      .set('system:time_start', (new Date(startYear+i,8,1)).valueOf());
                                      
                                      
          var addUB_band_image = ee.Image(reverse_all_annual_image_list.get(i))
                                   .addBands([UB_Sk.select(0),EX2.select(0),Var2.select(0)])
                                   .select([0,1,2,3],[index_put+'_'+type_put,'UB_Sk','EX','Var']);
              UBk = ee.Image(-1).multiply(addUB_band_image.select('UB_Sk').subtract(addUB_band_image.select('EX')).divide(addUB_band_image.select('Var').sqrt()));
              addUB_band_image = addUB_band_image.addBands(UBk.select(0).rename('UBk'))
                                      .select([0,1,2,3,4],[index_put+'_'+type_put,'UB_Sk','EX','Var','UBk'])
                                      .set('system:time_start', (new Date(endYear-i,8,1)).valueOf());
              
              UF_Sk_imagecol.push(addUF_band_image);
              UB_Sk_imagecol.push(addUB_band_image);
        }
    }
  //Get the UFk data
  UF_Sk_imagecol = ee.ImageCollection(UF_Sk_imagecol);

  //Get the UBk data , Here the 'reverse' operation is performed so that the 'combin' operation can be performed next
  UB_Sk_imagecol = ee.ImageCollection(ee.List(UB_Sk_imagecol).reverse());
  
  //Add 5% and -5% significant horizontal lines
  var significance_positive = ee.Image([1.96]);
  var significance_negetive = ee.Image([-1.96]);
  var M_K_disturb = UF_Sk_imagecol.combine(UB_Sk_imagecol,true);
  // Map.addLayer(M_K_disturb.select(['UFk','UBk']),{},'M_K_disturb'+index_put);
  
  /****The intersection of UF and UB***/
  var disturb = M_K_disturb.map(distrb_band);
  var max_mask = disturb.select('distrb').max().gt(0);
  var min_mask = disturb.select('distrb').min().lt(0);
  /********/
  var min_disturb = disturb.map(min_disturb_function).reduce(ee.Reducer.min(3)).select([0,1,2],['distrb','time','UFk']);
  var new_disturb_gain = min_disturb.select([1]).updateMask(max_mask).updateMask(min_mask).updateMask(min_disturb.select([2]).gt(0)).updateMask(mangrove_2021);//clip(mangrove_2019)
  var new_disturb_loss = min_disturb.select([1]).updateMask(max_mask).updateMask(min_mask).updateMask(min_disturb.select([2]).lt(0)).updateMask(mangrove_2021);
  var yui = disturb.select([1,3]).toArrayPerBand(0).arraySort(disturb.select([1]).toArrayPerBand(0));
  var Lack_mask = disturb.select([3]).toArrayPerBand(0).neq(-999);
  yui = yui.arrayMask(Lack_mask);
  var nui = MK_break_select(yui);
  Map.addLayer(new_disturb_gain.updateMask(nui),{min: 1986,max: 2020,palette: ["9400d3","4b0082","0000ff","00ff00","ffff00","ff7f00","ff0000"]},'new_disturb_gain_only'+'_'+index_put+'_'+type_put);
  
  Export.image.toDrive({
    image: new_disturb_gain.updateMask(nui),
    description:'1004MK_yod'+'_'+index_put+'_'+type_put,
    folder:'1004MK_yod_rigion',
    region: Beibu_Gulf,
    scale: 30,
    crs: 'EPSG:32649',
    maxPixels:34e10
  });
  

/*******************************************/
/**********MK significance testing*********/
/******************************************/

// DX is the variance of the sample
// sign is the Community function
// Z is salience image

var all_annual_image_unmask = all_annual_image.map(function(image){
  return image.unmask(-9999);
});
var all_annual_image_unmask_array = all_annual_image_unmask.toArrayPerBand(0);
var mask_array = all_annual_image_unmask_array.neq(-9999);
var all_annual_image_unmask_array0 =all_annual_image_unmask_array.arrayMask(mask_array);
var length1 = all_annual_image_unmask_array0.arrayLength(0);
var all_annual_image_unmask_array9999 = all_annual_image_unmask_array0.arrayPad([36],8888);
var length2 = all_annual_image_unmask_array9999.arrayLength(0);
var S = all_annual_image_unmask_array9999.arraySlice(0,0,1).gt(9999);
for(var n=1;n<36;n++){
    for(var m=0;m<n;m++){
    var compute_s = all_annual_image_unmask_array.arraySlice(0,n,n+1).gt(all_annual_image_unmask_array.arraySlice(0,m,m+1));
    var compute_where = compute_s.multiply(2).subtract(1);
    S = S.add(compute_where);
    }
}
var length_subtract = length2.subtract(length1);//The number of times each pixel is filled on the time series
S = S.subtract(length_subtract.multiply(-1).add(71).multiply(length_subtract).divide(2));
var image_shape = S.arrayFlatten([['S']]);
var n = length1.select([0],['S']);
var DX = n.multiply(n.subtract(1)).multiply(n.multiply(2).add(5)).divide(18);
var Z_1 = image_shape.gt(0).selfMask().multiply(image_shape).add(-1);
var Z_2 = image_shape.lt(0).selfMask().multiply(image_shape).add(1);
var Z_increace = Z_1.divide(DX.sqrt()).updateMask(mangrove_2021);
var Z_decreace = Z_2.divide(DX.sqrt()).updateMask(mangrove_2021);
Map.addLayer(Z_increace,{min:0,max:1.96,palette: ["9400d3","4b0082","0000ff","00ff00","ffff00","ff7f00","ff0000"]},'Z_increace');
Map.addLayer(Z_decreace,{min:-1.96,max:0,palette: ["9400d3","4b0082","0000ff","00ff00","ffff00","ff7f00","ff0000"]},'Z_decreace');
var Z = ee.ImageCollection.fromImages([Z_increace,Z_decreace]).mosaic();
Map.addLayer(Z,{min:-1.96,max:1.96,palette: ["9400d3","4b0082","0000ff","00ff00","ffff00","ff7f00","ff0000"]},'Z');


/*********************************/
/**********function tool********/
/*********************************/

// one year image composite--Landsat
function getSRcollection(year, startDay, endDay, sensor, box, ifwater) {
  var srCollection = ee.ImageCollection('LANDSAT/'+ sensor + '/C02/T1_L2') 
                       .filterBounds(box) 
                         .filterDate(year+startDay, year+endDay)//.filterDate(ee.Date(year), ee.Date(year).advance(1,'year'))
                       .map(Landsat_remove_cloud_SR)
                       .map(Scale_image_LS_SR)
                       .map(function(img){return img.float()});
  var srCollection_1;
  if(sensor == 'LT05'){
      srCollection_1 = srCollection.select(['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'],['B1', 'B2', 'B3', 'B4', 'B5', 'B7']);
  }  
  if(sensor == 'LE07'){
      srCollection_1 = srCollection.select(['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4', 'SR_B5', 'SR_B7'],['B1', 'B2', 'B3', 'B4', 'B5', 'B7']);
      // srCollection_1 = srCollection_1.map(function(image){
      // var filled1a = image.focal_mean(2, 'square', 'pixels', 1);
      // return image.blend(filled1a.blend(image)).float();});
  }     
  if(sensor == 'LC08'){
      srCollection_1 = srCollection.map(harmonizationRoy);
  } 
  if(sensor == 'LC09'){
      srCollection_1 = srCollection.map(harmonizationRoy);
  }     
  return srCollection_1; 
}

//one year image composite--sentinel-2
function getSRcollection_s2(year, startDay, endDay, box) {
  var srCollection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED') 
                       .filterBounds(box) 
                      .filterDate(ee.Date(year), ee.Date(year).advance(1,'year'))
  var sentinel_cloud_po = ee.ImageCollection("COPERNICUS/S2_CLOUD_PROBABILITY")
                            .filterBounds(box)
                            .filterDate(ee.Date(year), ee.Date(year).advance(1,'year'))
  var sr_remove_cloud = Sentinel2_remove_cloud2(srCollection, sentinel_cloud_po)
                      .map(Scale_image_LS_B) 
                      .map(resample_s2);
  return srCollection.select(['B2','B3','B4','B8','B11','B12'],['B1', 'B2', 'B3', 'B4', 'B5', 'B7']); 
}

// composite inter-annal time series
function makeLtStack(startYear, endYear, startDay, endDay, roi, ifwater, ifsentinl2, index, value_select){
  var imgs = [];
  for(var k = startYear ; k<=endYear ;k++ ){
    var year_collection= getCombinedSRcollection(k, startDay, endDay, roi, ifwater, ifsentinl2);
    var year_index = one_year_index(year_collection, k, index, value_select).select([index]);
    imgs.push(year_index);
  }
  return ee.ImageCollection(imgs);
}


//sentinel-2 resample 30m
function resample_s2(image){
  var targetProjection = ee.Projection('EPSG:32649').atScale(30);
  var resampledImage = image.resample('bilinear').reproject({
    crs: targetProjection,
    scale: 30
  });
  return resampledImage;
}

//merge one year all images
function getCombinedSRcollection(year, startDay, endDay, box, ifwater, ifsentinl2) {
    var lt5 = getSRcollection(year, startDay, endDay, 'LT05', box, ifwater); 
    var le7 = getSRcollection(year, startDay, endDay, 'LE07', box, ifwater);  
    var lc8 = getSRcollection(year, startDay, endDay, 'LC08', box, ifwater); 
    var lc9 = getSRcollection(year, startDay, endDay, 'LC09', box, ifwater); 
    if(ifsentinl2){
      var se2  = getSRcollection_s2(year, startDay, endDay, box);
      return  ee.ImageCollection(lt5.merge(le7).merge(lc8).merge(lc9)).merge(se2); 
    }
    else
      return  ee.ImageCollection(lt5.merge(le7).merge(lc8).merge(lc9));
}

function one_year_index(imagecollection, year, index, value_select){
  var band_short = function(image){
  return image.short();
  };
  var indexImgcol;
    switch (index){
      case 'B1':
        indexImgcol = imagecollection.select(['B1']).map(band_short);
        break;
      case 'B2':
        indexImgcol = imagecollection.select(['B2']).map(band_short);
        break;
      case 'B3':
        indexImgcol = imagecollection.select(['B3']).map(band_short);
        break;
      case 'B4':
        indexImgcol = imagecollection.select(['B4']).map(band_short);
        break;
      case 'B5':
        indexImgcol = imagecollection.select(['B5']).map(band_short);
        break;
      case 'B7':
        indexImgcol = imagecollection.select(['B7']).map(band_short);
        break;
      case 'NDVI':
        indexImgcol = imagecollection.map(ndviTransform);
        break;
      case 'EVI':
        indexImgcol = imagecollection.map(eviTransform);
        break;        
      case 'NDMIw':
        indexImgcol = imagecollection.map(ndmiwTransform);
        break;
     case 'LAI':
        indexImgcol = imagecollection.map(laiTransform);
        break;
     case 'GDVI':
        indexImgcol = imagecollection.map(gdviTransform);
        break;
      default:
        print('The index you provided is not supported');
    }
    var indexImg;
    
  switch (value_select){
     case 'max':
          indexImg = indexImgcol.max();
          break;
     case 'min':
          indexImg = indexImgcol.min();
          break;
     case 'median':
          indexImg = indexImgcol.median();
          break;
     case 'mean':
          indexImg = indexImgcol.mean();
          break;
      default:
       indexImg = indexImgcol;
       return indexImg;
  }
      return indexImg.set('system:time_start', (new Date(year,8,1)).valueOf());
};

// Landsat_remove_cloud 
function Landsat_remove_cloud_SR(image) {
  var qa = image.select('QA_PIXEL');
  var mask = qa.bitwiseAnd(4).eq(0).and( // Cirrus           4 = 1<<2
             qa.bitwiseAnd(8).eq(0).and( // Cloud            8 = 1<<3
             qa.bitwiseAnd(16).eq(0)).and( // Cloud Shadow   16 = 1<<4
             qa.bitwiseAnd(32).eq(0))); // Snow              32 = 1<<5
  return image.updateMask(mask);
}

//Sentinel2_remove_cloud1 
var Sentinel2_remove_cloud1 = function(image) { 
  var qa = image.select('QA60'); 
  var cloudBitMask = 1 << 10; 
  var cirrusBitMask = 1 << 11; 
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0) 
              .and(qa.bitwiseAnd(cirrusBitMask).eq(0));
  return image.updateMask(mask);
};

//Sentinel2_remove_cloud2 
function Sentinel2_remove_cloud2(sentinel_sr, sentinel_cloud_po){
  var rmCloudByProbability = function(image, thread) { 
    var prob = image.select("probability"); 
    return image.updateMask(prob.lte(thread)); 
  } ;
  
  var getMergeImages = function(primary, secondary) { 
    var join = ee.Join.inner(); 
    var filter = ee.Filter.equals({ 
      leftField: 'system:index', 
      rightField: 'system:index' 
    }); 
    var joinCol = join.apply(primary, secondary, filter); 
    joinCol = joinCol.map(function(image) { 
      var img1 = ee.Image(image.get("primary")); 
      var img2 = ee.Image(image.get("secondary")); 
      return img1.addBands(img2); 
    }); 
    return ee.ImageCollection(joinCol); 
  }; 
  var s2Imgs = getMergeImages(sentinel_sr, sentinel_cloud_po); 
  var s2Imgs_final = s2Imgs.map(function(image) { 
    return rmCloudByProbability(image, 90); 
  }); 
  return s2Imgs_final;
}

// multiply Scale and offset 
function Scale_image_LS_SR(image){
  var scale_image = image.multiply(0.0000275).add(-0.2).float();
  return scale_image.copyProperties(image, image.propertyNames());
}//LS

function Scale_image_LS_B(image){
  var scale_image = image.multiply(0.0001).float();
  return scale_image.copyProperties(image, image.propertyNames());
}//S2

// slope and intercept citation: Roy, D.P., Kovalskyy, V., Zhang, H.K., Vermote, E.F., Yan, L., Kumar, S.S, Egorov, A., 2016, Characterization of Landsat-7 to Landsat-8 reflective wavelength and normalized difference vegetation index continuity, Remote Sensing of Environment, 185, 57-70.(http://dx.doi.org/10.1016/j.rse.2015.12.024); Table 2 - reduced major axis (RMA) regression coefficients
function harmonizationRoy(oli) {
  var slopes = ee.Image.constant([0.9785, 0.9542, 0.9825, 1.0073, 1.0171, 0.9949]); 
  var itcp = ee.Image.constant([-0.0095, -0.0016, -0.0022, -0.0021, -0.0030, 0.0029]); 
  var y = oli.select(['SR_B2','SR_B3','SR_B4','SR_B5','SR_B6','SR_B7'],['B1', 'B2', 'B3', 'B4', 'B5', 'B7']) 
             .subtract(itcp).divide(slopes) 
             .copyProperties(oli,oli.propertyNames()); 
  return y;//.float(); 
}

// harmonize tm and etm+ to oli
function harmonizationRoy2OLI(tm) {
  var slopes = ee.Image.constant([0.9785, 0.9542, 0.9825, 1.0073, 1.0171, 0.9949]);        
  var itcp = ee.Image.constant([-0.0095, -0.0016, -0.0022, -0.0021, -0.0030, 0.0029]);    
  var y = tm.select(['SR_B1','SR_B2','SR_B3','SR_B4','SR_B5','SR_B7'],['B1', 'B2', 'B3', 'B4', 'B5', 'B7'])    
             //.resample('bicubic')                                                
             .multiply(slopes).add(itcp)                      
             .copyProperties(tm,tm.propertyNames());                
  return y;//.float(); 
}

/***************************************************************************************/
/****************************vegetation index*******************************************/
/***************************************************************************************/
//NDMI--CWC
function ndmiwTransform(img){ 
  var ndmiw = img.normalizedDifference(['B4', 'B5'])
                .select([0], ['NDMIw']) 
                .float()
                .set('system:time_start', img.get('system:time_start'));
  return img.addBands(ndmiw);
}

//NDVI
function ndviTransform(img){ 
  var ndvi = img.normalizedDifference(['B4', 'B3'])
                .select([0], ['NDVI']) 
                .float()
                .set('system:time_start', img.get('system:time_start'));
  return img.addBands(ndvi);
}

//EVI
function eviTransform(img) {
var evi = img.expression(
  "(2.5*(NIR-Red))/(NIR+6*Red-7.5*BLUE+1)",
  {
    "NIR": img.select("B4"),
    "Red": img.select("B3"),
    "BLUE":img.select("B1")
  }).select([0], ['EVI']) 
    .float()
    .set('system:time_start', img.get('system:time_start'));
  return img.addBands(evi);
}

//LAI 
var laiTransform = function(img) {
  var evi = eviTransform(img).select('EVI');
  var lai = evi.multiply(3.618).subtract(0.118)
               .select([0], ['LAI'])
               .float()
               .set('system:time_start', img.get('system:time_start'));
  return img.addBands(lai);
};

//GDVI
function gdviTransform(img) {
    var gdvi = img.select('B4').subtract(img.select('B2'))                                       
                  .select([0], ['GDVI'])
                  .float()
                  .set('system:time_start', img.get('system:time_start')); 
    return img.addBands(gdvi) ;
}