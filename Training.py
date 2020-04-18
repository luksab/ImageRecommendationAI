#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Apr 16 12:05:51 2020

@author: lukas
"""
from PIL import ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True


import pandas as pd
df=pd.read_csv(r"./ratings.csv")

from keras_preprocessing.image import ImageDataGenerator

datagen = ImageDataGenerator(
    rescale=1./255,
    zca_whitening=False,
    rotation_range=13.,
    width_shift_range=0.05,
    height_shift_range=0.05,
    shear_range=0.05,
    zoom_range=0.05,
    channel_shift_range=0.05,
    fill_mode='nearest',
    horizontal_flip=True,
    vertical_flip=False)



train_generator=datagen.flow_from_dataframe(dataframe=df, 
    directory="/run/media/lukas/Data4Tb/danbooru2019/original/", 
    x_col="x_col", y_col="y_col", class_mode="raw", 
    target_size=(224,224), batch_size=64, 
    interpolation="lanczos", validate_filenames=False)#, 
    #save_to_dir="saves", save_format="jpg")

from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow import keras

# create the base pre-trained model
base_model = MobileNetV2(weights='imagenet', include_top=False)

# add a global spatial average pooling layer
x = base_model.output
x = GlobalAveragePooling2D()(x)
# let's add a fully-connected layer
#x = Dense(1024, activation='relu')(x)
x = Dense(512, activation='tanh')(x)
predictions = Dense(1, activation='sigmoid')(x)

# this is the model we will train
model = Model(inputs=base_model.input, outputs=predictions)

# first: train only the top layers (which were randomly initialized)
# i.e. freeze all convolutional InceptionV3 layers
for layer in base_model.layers:
    layer.trainable = False

import keras.backend as K
def mean_pred(y_true, y_pred):
    return K.mean(y_pred)
def std_pred(y_true, y_pred):
    return K.std(y_pred)

#model = keras.models.load_model('trainedModel.h5')

# compile the model (should be done *after* setting layers to non-trainable)
model.compile(optimizer='sgd', loss='mean_squared_error', 
              metrics=[mean_pred, std_pred]
              )

from tensorflow import keras
logdir = "logs/scalars/"# + datetime.now().strftime("%Y%m%d-%H%M%S")
tensorboard_callback = keras.callbacks.TensorBoard(log_dir=logdir)


model.fit(x=train_generator, steps_per_epoch=32,
     epochs=10, 
     #callbacks=[tensorboard_callback],
     )

for layer in base_model.layers:
    layer.trainable = True

model.compile(optimizer='sgd', loss='mean_squared_error', 
              metrics=[mean_pred, std_pred]
              )

model.fit(x=train_generator, steps_per_epoch=32,
     epochs=10, 
     #callbacks=[tensorboard_callback],
     )

model.compile(optimizer='sgd', loss='mean_squared_error', 
              #metrics=[mean_pred, std_pred]
              )
model.save('trainedModel.h5')


import random
import numpy as np
def predict():
    print(model.predict_generator(train_generator,steps=1))




