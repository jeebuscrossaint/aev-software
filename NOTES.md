Ok so besides the monitor with high end peripherals, we also need to have backup stuff just in case... so

## Backups
Since we can have multiple GPS modules we should have one for the RPI and backup Arduino...

### Arduino & Modules for Speed

- [OLED Display for Speed](https://www.amazon.com/Waveshare-Communication-Compatible-Raspberry-forArduino/dp/B0CTC9D9RD/ref=asc_df_B0CTC9D9RD/?tag=hyprod-20&linkCode=df0&hvadid=693611984331&hvpos=&hvnetw=g&hvrand=9444049987823752738&hvpone=&hvptwo=&hvqmt=&hvdev=c&hvdvcmdl=&hvlocint=&hvlocphy=9052628&hvtargid=pla-2294915495675&psc=1&mcid=4fa5b3fad2e63043906f8ad6fd4d3028&gad_source=1#customerReviews)
- [2x GPS Module for Speed](https://www.amazon.com/HiLetgo-GY-NEO6MV2-Controller-Ceramic-Antenna/dp/B01D1D0F5M?keywords=neo6m+gps+module&qid=1678434398&sprefix=neo6m,aps,547&sr=8-1-spons&psc=1&spLa=ZW5jcnlwdGVkUXVhbGlmaWVyPUFXWUJZVDZGMENIMDkmZW5jcnlwdGVkSWQ9QTAwNDQyNjJFVzI2V05VSEJYNjYmZW5jcnlwdGVkQWRJZD1BMDUyOTI5M0I0SzdMUlVaWFVQRSZ3aWRnZXROYW1lPXNwX2F0ZiZhY3Rpb249Y2xpY2tSZWRpcmVjdCZkb05vdExvZ0NsaWNrPXRydWU%3D&linkCode=sl1&tag=ahmadlogs01-20&linkId=2ee469c4fabbeb004a6b0132608f0168&language=en_US&ref_=as_li_ss_tl#customerReviews)
- [Arduino Board](https://www.amazon.com/ELEGOO-Board-ATmega328P-ATMEGA16U2-Compliant/dp/B01EWOE0UU/ref=sr_1_4?dib=eyJ2IjoiMSJ9.MazmhFfn-DF8W5oyX_S-tDFAqLRDaMJSkroaZhdQMdiZSuWGwLcb74aQq9EggWoRyGDA3Nq8bShsH9wUhX6Pj0y3bPFJhH1iFfFh-63f4Ws1sWrZi1SARLwo-Pc_bAXuyIKepXIvoycCC8_PW_Yk1NREY5D6yh_9v-4kgRr53-dbTAnJCJyl_hPLovEy_CwmeiLSDbf1RfFrUeAfmdkpRnH9mZl4BmMdM5SbQxHwGZs.ANE2jcFx7Byud5J1yyrsamKmnBdjrisBIJ7XZJslKp4&dib_tag=se&keywords=arduino%2Buno&qid=1717041590&sr=8-4)

- [Arduino GPS Speed Code](https://github.com/ahmadlogs/arduino-ide-examples/tree/main/speedometer-v2)
- [Vid](https://www.youtube.com/watch?v=gKuJxjxNP-k)

#### Optional
- [Accelerometer & Gyroscopic Sensor](https://www.amazon.com/HiLetgo-MPU-6050-Accelerometer-Gyroscope-Converter/dp/B00LP25V1A/ref=sr_1_2?crid=115FZ8CIVWCBN&dib=eyJ2IjoiMSJ9.Cl_bliysQ0eBCdVLmqnbh5us8YiUkM8tlvHegfoHi0VzfuRGX010ZB-w-WRr4tHMuJzAWgYirdUi3fqJUu8JVqsurw0vgeY1JBohm4JDtlMTZeaaO348Lyx7hg64UhnKnfCPv32Okm1kzzKdv5xmHBvhgCE-dhvW84NOSZT2NaHalGX2KwZm5H-4kOlHsvmjmdBi1_Fj66uQPjQ1G7m41XXC406QDWrjr3GzL8LFp3ZPWSLTudyemyIbVBQcmT6IXIV98tK4nT13dqqCbVXq8jq4KKAEgU7MxEhDxla9NyE.mgci55aFnNq-Ng0MY2fRCd7cROnmyR9I3fBg0xrrHd0&dib_tag=se&keywords=gyroscope+arduino&qid=1717043706&s=industrial&sprefix=gyroscope+arduino%2Cindustrial%2C126&sr=1-2)

### Battery Backup Display

- [LCD 300A Battery Meter](https://www.amazon.com/dp/B07T9LV66P?ref=cm_sw_r_apan_dp_8SFKQ0CSMR079MCC3AZ3&ref_=cm_sw_r_apan_dp_8SFKQ0CSMR079MCC3AZ3&social_share=cm_sw_r_apan_dp_8SFKQ0CSMR079MCC3AZ3&starsLeft=1&skipTwisterOG=2&th=1)


## This Week
All of us on Friday -solder the motor controller usb so we can test it to see if it works
Amarnath - make speaker do speaker things
Jossaya - make motor controller parser
Thandi - make AGS bar and hyprland config 
Me - finish BMS, motor controller, and hopefully 3js frontend 

Then we gotta test everything and make the startup script with hyprctl and all of the commands to run frontend, backend, and speaker stuff if that needs smth to be started

Then we install the screen and help with camera wiring + connections bc we gotta get like extensors for all the USBs we connecting BUT we’re prob gonna have to plan out where the pi gonna go and make a backup just in case 

Now we gotta figure out how to transmit data to the pits (maybe radio?)