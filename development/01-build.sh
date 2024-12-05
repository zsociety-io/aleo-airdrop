source ./development/.env

build_from_path () {
    build_path="$1"
    cd $build_path;
    leo build --network $NETWORK --endpoint $NODE_URL;
    only_slash="${build_path//[^\/]}";
    slash_amount="${#only_slash}";
    back_steps=$(printf '../%.0s' $(seq 1 $slash_amount));
    cd $back_steps;
}


build_from_path "./programs/airdrop";
build_from_path "./programs/aleo-standard-programs/token_registry";
