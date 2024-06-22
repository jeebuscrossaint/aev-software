use rppal::gpio::Gpio;
use std::thread;
use std::time::Duration;

fn main() {
    let mut pin = Gpio::new().unwrap().get(17).unwrap().into_output();

    for _ in 0..5 {
        pin.set_high();
        thread::sleep(Duration::from_secs(1));
        pin.set_low();
        thread::sleep(Duration::from_secs(1));
    }
}