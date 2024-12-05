
source ./development/.env


deploy_program () {
    build_path="$1/build"
    cd $build_path;
    snarkos developer deploy \
        --private-key $PRIVATE_KEY \
        --query $NODE_URL \
        --priority-fee 0 \
        --broadcast "$NODE_URL/$NETWORK/transaction/broadcast" \
        --network $([[ $NETWORK == "mainnet" ]] && echo 0 || echo 1) \
        "$2.aleo";
    only_slash="${build_path//[^\/]}";
    slash_amount="${#only_slash}";
    back_steps=$(printf '../%.0s' $(seq 1 $slash_amount));
    cd $back_steps;
}

deploy_program "./programs/aleo-standard-programs/token_registry" "token_registry";
deploy_program "./programs/airdrop" "token_registry_airdrop_32b";

