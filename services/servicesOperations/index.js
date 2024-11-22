/* eslint-disable import/no-anonymous-default-export */
// tableName: eşleşecek tablonun ismi
// where:     eşleşecek tablodaki verinin anahtar değeri örn: {email: "enes.gulcu@hotmail.com"} (mail) değeri oluyor.
// newData:   yeni eklenecek veya güncellenecek veri

import prisma from "@/lib/prisma";

// GET ALL
export async function getAllData(tableName, params = {}) {
  try {
    const data = await prisma[tableName].findMany(params);
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

// GET BY UNIQUE MANY VALUE
export async function getDataByUniqueMany(tableName, where, orderBy) {
  try {
    const data = await prisma[tableName].findMany({
      where: where,
      orderBy: orderBy,
    });
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

// POST
export async function createNewData(tableName, newData) {
  try {
    const data = await prisma[tableName].create({ data: newData });
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

// POST MANY --> newData = [{}, {}, {}]
export async function createNewDataMany(tableName, newData) {
  try {
    const data = await prisma[tableName].createMany({ data: newData });
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

// GET BY UNIQUE ONE VALUE
export async function getDataByUnique(tableName, where, select) {
  try {
    const data = await prisma[tableName].findUnique({
      where: where,
      select: select, // Select parametrini istifadə etmək
    });
    return data;
  } catch (error) {
    console.error("Error fetching data from table: ", error);
    return { error: error.message };
  }
}

// GET BY UNIQUE MANY VALUE
export async function getDataByMany(tableName, where) {
  try {
    const data = await prisma[tableName].findMany({ where: where });
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

// GET BY UNIQUE MANY VALUE
export async function getDataByManyV2(tableName, query) {
  try {
    const data = await prisma[tableName].findMany(query);
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

// UPDATE
export async function updateDataByAny(tableName, where, newData) {
  try {
    const data = await prisma[tableName].update({
      where: where,
      data: newData,
    });
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

// UPDATE MANY
export async function updateDataByMany(tableName, where, newData) {
  try {
    const data = await prisma[tableName].updateMany({
      where: where,
      data: newData,
    });
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

//DELETE
export async function deleteDataByAny(tableName, where) {
  try {
    const data = await prisma[tableName].delete({ where: where });
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

//DELETE MANY
export async function deleteDataByMany(tableName, where) {
  try {
    const data = await prisma[tableName].deleteMany({ where: where });
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

//DELETE ALL
export async function deleteDataAll(tableName) {
  try {
    const data = await prisma[tableName].deleteMany({});
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

// createNewProduct (Special Service)
export async function createNewProduct(tableName, newData) {
  try {
    const data = await prisma[tableName].create({
      data: {
        ...newData,
        productFeatures: {
          create: newData.productFeatures,
        },
      },
    });
    return data;
  } catch (error) {
    return { error: error.message };
  }
}

export async function updateProduct(productId, updatedProductData) {
  try {
    const updatedProduct = await prisma.products.update({
      where: {
        id: productId,
      },
      data: {
        ...updatedProductData,
        // prisma - mon go db ye göre update işlemi uygula.
        productFeatures: {
          deleteMany: {}, // hepsini sil
          create: updatedProductData.productFeatures, // yeni verileri ekle
        },
      },
    });

    return updatedProduct;
  } catch (error) {
    return { error: error.message };
  }
}

//  YENİ EKLENDİ!!!

// findFirst (special service)
export async function findFirstFinancialManagement(tableName) {
  try {
    const result = await prisma[tableName].findFirst({
      select: {
        orderValue: true,
      },
      orderBy: {
        orderValue: "desc",
      },
    });

    if (result) {
      // En büyük değeri alıp +1 ekler.
      return (result.orderValue = result.orderValue + 1);
    }

    // Eğer veri yoksa veya çevirme işlemi başarısızsa başlangıç bir değer belirleyebilirsiniz, örneğin "1"
    return 1;
  } catch (error) {
    return { error: error.message };
  }
}

export async function findAndUpdateManyFinancialManagement(
  tableName,
  desiredOrder
) {
  try {
    // Kullanıcının istediği sıradaki veriyi bulun
    const existingData = await prisma[tableName].findFirst({
      where: {
        orderValue: desiredOrder,
      },
    });

    // Kullanıcının istediği sıradan sonraki tüm verilere +1 ekleyin
    if (existingData) {
      const recordsToUpdate = await prisma[tableName].findMany({
        where: {
          orderValue: {
            gte: desiredOrder,
          },
        },
      });
      for await (const record of recordsToUpdate) {
        const currentOrder = parseInt(record.orderValue);
        await prisma[tableName].update({
          where: {
            id: record.id,
          },
          data: {
            orderValue: currentOrder + 1,
          },
        });
      }
      return existingData;
    } else {
      return "Böyle bir veri bulunamadı.";
    }
  } catch (error) {
    return { error: error.message };
  }
}

// Silme işleminde order değerini azaltmak için burası çalışır.
export async function findAndUpdateAndDecreaseManyFinancialManagement(
  tableName,
  orderValue
) {
  try {
    // Kullanıcının istediği sıradaki veriyi bulun
    const existingData = await prisma[tableName].findFirst({
      where: {
        orderValue: orderValue,
      },
    });

    // Kullanıcının istediği sıradan sonraki tüm verilere +1 ekleyin
    if (existingData) {
      const recordsToUpdate = await prisma[tableName].findMany({
        where: {
          orderValue: {
            gte: orderValue,
          },
        },
      });
      for await (const record of recordsToUpdate) {
        const currentOrder = parseInt(record.orderValue);
        await prisma[tableName].update({
          where: {
            id: record.id,
          },
          data: {
            orderValue: currentOrder - 1,
          },
        });
      }
      return existingData;
    } else {
      return "Böyle bir veri bulunamadı.";
    }
  } catch (error) {
    return { error: error.message };
  }
}

export async function updateOrderValueWhenChange(tableName, data) {
  try {
    const existingData = await prisma[tableName].findFirst({
      where: {
        orderValue: data.oldOrderValue,
      },
    });

    if (existingData) {
      const recordsToUpdate = await prisma[tableName].findMany({
        where: {
          orderValue: {
            gte: Math.min(data.oldOrderValue, data.orderValue),
            lte: Math.max(data.oldOrderValue, data.orderValue),
          },
        },
      });

      for await (const record of recordsToUpdate) {
        const currentOrder = parseInt(record.orderValue);
        if (data.oldOrderValue <= data.orderValue) {
          await prisma[tableName].update({
            where: {
              id: record.id,
            },
            data: {
              orderValue: currentOrder - 1,
            },
          });
        } else {
          await prisma[tableName].update({
            where: {
              id: record.id,
            },
            data: {
              orderValue: currentOrder + 1,
            },
          });
        }
      }

      return recordsToUpdate;
    }
  } catch (error) {
    return { error: error.message };
  }
}
export default {
  getAllData,

  getDataByUniqueMany,
  getDataByManyV2,

  createNewData,

  createNewDataMany,

  getDataByUnique,

  updateDataByAny,

  updateDataByMany,

  deleteDataByAny,

  deleteDataByMany,

  deleteDataAll,

  // Special Service
  createNewProduct,

  // Special Service
  updateProduct,

  // Special Service
  findFirstFinancialManagement,

  // Special Service
  findAndUpdateManyFinancialManagement,

  // Special Service
  findAndUpdateAndDecreaseManyFinancialManagement,

  // Special Service
  updateOrderValueWhenChange,
};
