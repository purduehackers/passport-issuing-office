use zgui::prelude::*;

fn main() -> Result<(), zgui::Error> {
    app()
        .with_title("Purdue Hackers Passport Activator")
        .with_size(480.0, 320.0)
        .with_stylesheet(css!(
            ":root {
                background-color: #12141a;
                color: #e8ecf4;
                font-family: sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .hello { font-size: 32px; font-weight: 700; }"
        ))
        .run(|| view! { text(class = "hello") {"Hello"} })
}